import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '../api/axiosInstance'

// ── Types ────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'STAFF' | 'VIEWER'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null   // kept in memory only — never written to localStorage
  refreshToken: string | null  // persisted to localStorage for session restore
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  isAuthenticated: boolean
  hasRole: (...roles: UserRole[]) => boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Storage helpers ───────────────────────────────────────────
// accessToken is intentionally NOT written to localStorage (XSS mitigation).
// Only the refreshToken and non-sensitive user metadata are persisted.
function saveAuth(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(user))
  // Keep accessToken in the module-level variable so axiosInstance can read it
  // without going through localStorage.
  setMemoryToken(accessToken)
}

function clearAuth() {
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  setMemoryToken(null)
}

function loadAuth(): Omit<AuthState, 'accessToken'> & { accessToken: null } {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    const raw = localStorage.getItem('user')
    if (refreshToken && raw) {
      return { user: JSON.parse(raw) as AuthUser, accessToken: null, refreshToken, loading: false }
    }
  } catch { /* corrupted storage — ignore */ }
  return { user: null, accessToken: null, refreshToken: null, loading: false }
}

// ── In-memory access token (module scope, not React state) ────
// Avoids localStorage exposure while still being readable by axiosInstance.
let _memoryToken: string | null = null
export function getMemoryToken() { return _memoryToken }
export function setMemoryTokenFromInterceptor(t: string | null) { _memoryToken = t }
function setMemoryToken(t: string | null) { _memoryToken = t }

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, refreshToken: null, loading: true })

  // Hydrate on mount: if a refreshToken exists, silently get a fresh accessToken.
  // accessToken is never stored in localStorage, so we must refresh on every page load.
  useEffect(() => {
    const saved = loadAuth()
    if (saved.refreshToken) {
      api.post('/v1/auth/refresh', null, {
        headers: { 'X-Refresh-Token': saved.refreshToken },
      }).then(res => {
        const { accessToken, refreshToken: newRefresh, user } = res.data as {
          accessToken: string; refreshToken: string
          user: { id: string; name: string; email: string; role: UserRole }
        }
        const authUser: AuthUser = { id: String(user.id), name: user.name, email: user.email, role: user.role }
        saveAuth(accessToken, newRefresh, authUser)
        setState({ user: authUser, accessToken, refreshToken: newRefresh, loading: false })
      }).catch(() => {
        clearAuth()
        setState({ user: null, accessToken: null, refreshToken: null, loading: false })
      })
    } else {
      setState({ user: null, accessToken: null, refreshToken: null, loading: false })
    }
  }, [])

  // ── Multi-tab logout sync ──────────────────────────────────
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'refreshToken' && e.newValue === null) {
        setMemoryToken(null)
        setState({ user: null, accessToken: null, refreshToken: null, loading: false })
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // ---------- LOGIN ----------
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/v1/auth/login', { email, password })
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    }
    saveAuth(accessToken, refreshToken, authUser)
    setState({ user: authUser, accessToken, refreshToken, loading: false })
    
  }, [])

  // ---------- REGISTER ----------
  const register = useCallback(async (data: RegisterPayload) => {
    const res = await api.post('/v1/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    }
    saveAuth(accessToken, refreshToken, authUser)
    setState({ user: authUser, accessToken, refreshToken, loading: false })
  }, [])

  // ---------- LOGOUT ----------
  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken')
      if (rt) {
        await api.post('/v1/auth/logout', null, {
          headers: { 'X-Refresh-Token': rt },
        })
      }
    } catch {
      // Best-effort: even if the backend call fails (network down,
      // token already expired), we still clear local state so the
      // user is logged out on the client side.
    }
    clearAuth()
    setState({ user: null, accessToken: null, refreshToken: null, loading: false })
  }, [])

  // ---------- REFRESH SESSION ----------
  // Manually trigger a token refresh. Returns true if successful.
  // Useful for long-lived pages that want to proactively refresh
  // before the token expires, rather than waiting for a 401.
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const rt = localStorage.getItem('refreshToken')
      if (!rt) return false

      const res = await api.post('/v1/auth/refresh', null, {
        headers: { 'X-Refresh-Token': rt },
      })
      const { accessToken, refreshToken: newRefresh, user } = res.data
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      }
      saveAuth(accessToken, newRefresh, authUser)
      setState({ user: authUser, accessToken, refreshToken: newRefresh, loading: false })
      return true
    } catch {
      // Refresh failed — session is dead
      clearAuth()
      setState({ user: null, accessToken: null, refreshToken: null, loading: false })
      return false
    }
  }, [])

  // ---------- Helpers ----------
  const isAuthenticated = !!state.user && !!state.accessToken
  const hasRole = useCallback(
    (...roles: UserRole[]) => !!state.user && roles.includes(state.user.role),
    [state.user],
  )

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshSession, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
