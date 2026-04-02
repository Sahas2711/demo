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
    } catch { /* best-effort */ }
    clearAuth()
    setState({ user: null, accessToken: null, refreshToken: null, loading: false })
  }, [])

  // ---------- Helpers ----------
  const isAuthenticated = !!state.user && !!state.accessToken
  const hasRole = useCallback(
    (...roles: UserRole[]) => !!state.user && roles.includes(state.user.role),
    [state.user],
  )

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isAuthenticated, hasRole }}>
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
