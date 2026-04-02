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
  accessToken: string | null
  refreshToken: string | null
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

// ── Helper: persist / restore ────────────────────────────────
function saveAuth(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

function loadAuth(): AuthState {
  try {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const raw = localStorage.getItem('user')
    if (accessToken && raw) {
      return { user: JSON.parse(raw), accessToken, refreshToken, loading: false }
    }
  } catch { /* corrupted storage — ignore */ }
  return { user: null, accessToken: null, refreshToken: null, loading: false }
}

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, refreshToken: null, loading: true })

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadAuth()
    setState({ ...saved, loading: false })
  }, [])

  // ── Multi-tab logout sync ──────────────────────────────────
  // When another tab clears auth from localStorage, this tab
  // should also reflect the logged-out state immediately.
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'accessToken' && e.newValue === null) {
        // Token was removed in another tab → sync logout here
        setState({ user: null, accessToken: null, refreshToken: null, loading: false })
      }
      if (e.key === 'user' && e.newValue !== null) {
        // User data updated in another tab (e.g. after token refresh) → sync
        try {
          const updatedUser = JSON.parse(e.newValue)
          const token = localStorage.getItem('accessToken')
          const rt = localStorage.getItem('refreshToken')
          if (token) {
            setState({ user: updatedUser, accessToken: token, refreshToken: rt, loading: false })
          }
        } catch { /* ignore parse errors */ }
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
