import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import api, { setMemoryToken } from '../api/axiosInstance'

export type UserRole = 'ADMIN' | 'STAFF' | 'VIEWER'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
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

function save(user: AuthUser, token: string) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('accessToken', token)
}

function saveRefreshToken(refreshToken: string) {
  localStorage.setItem('refreshToken', refreshToken)
}

function clear() {
  localStorage.removeItem('user')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getMemoryToken() {
  return localStorage.getItem('accessToken')
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw) as AuthUser
    if (!u.id || !u.email || !u.role) { clear(); return null }
    return u
  } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem('accessToken')
  if (storedToken) setMemoryToken(storedToken)

  const [state, setState] = useState<AuthState>(() => {
    const user = loadUser()
    const token = localStorage.getItem('accessToken')
    if (user && token) return { user, loading: false }
    return { user: null, loading: false }
  })

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/v1/auth/login', { email, password })
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = {
      id: user.id, name: user.name, email: user.email, role: user.role as UserRole,
    }
    setMemoryToken(accessToken)
    save(authUser, accessToken)
    saveRefreshToken(refreshToken)
    setState({ user: authUser, loading: false })
  }, [])

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await api.post('/v1/auth/register', data)
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = {
      id: user.id, name: user.name, email: user.email, role: user.role as UserRole,
    }
    setMemoryToken(accessToken)
    save(authUser, accessToken)
    saveRefreshToken(refreshToken)
    setState({ user: authUser, loading: false })
  }, [])

  const refreshSession = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      return
    }

    const res = await authApi.refresh()
    const { accessToken, refreshToken: nextRefreshToken, user } = res.data
    const authUser: AuthUser = {
      id: user.id, name: user.name, email: user.email, role: user.role as UserRole,
    }
    setMemoryToken(accessToken)
    save(authUser, accessToken)
    saveRefreshToken(nextRefreshToken)
    setState({ user: authUser, loading: false })
  }, [])



  const logout = useCallback(async () => {
    try { await api.post('/v1/auth/logout') } catch { /* best-effort */ }
    setMemoryToken(null)
    clear()
    setState({ user: null, loading: false })
  }, [])

  const isAuthenticated = !!state.user
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
