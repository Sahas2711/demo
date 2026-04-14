import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '../api/axiosInstance'

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

// In-memory access token
let _memoryToken: string | null = null
export function getMemoryToken() { return _memoryToken }
export function setMemoryTokenFromInterceptor(token: string | null) { _memoryToken = token }

function saveUser(user: AuthUser) { localStorage.setItem('user', JSON.stringify(user)) }
function clearUser() { localStorage.removeItem('user'); localStorage.removeItem('refreshToken') }
function loadUser(): AuthUser | null {
  try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null }
  catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => { setState({ user: loadUser(), loading: false }) }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/v1/auth/login', { email, password })
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role as UserRole }
    _memoryToken = accessToken
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    saveUser(authUser)
    setState({ user: authUser, loading: false })
  }, [])

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await api.post('/v1/auth/register', data)
    const { accessToken, refreshToken, user } = res.data
    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role as UserRole }
    _memoryToken = accessToken
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    saveUser(authUser)
    setState({ user: authUser, loading: false })
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/v1/auth/logout') } catch { /* best-effort */ }
    _memoryToken = null
    clearUser()
    setState({ user: null, loading: false })
  }, [])

  const isAuthenticated = !!state.user
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
