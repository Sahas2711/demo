import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type UserRole } from '../context/AuthContext'

// ── Role → default landing page ─────────────────────────────
const ROLE_HOME: Record<UserRole, string> = {
  ADMIN:  '/dashboard',
  STAFF:  '/staff',
  VIEWER: '/viewer',
}

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Which roles may access this route. If omitted, any authenticated user may enter. */
  allowedRoles?: UserRole[]
}

/**
 * Wraps a route so that:
 *  1. Unauthenticated users are sent to /login
 *  2. Authenticated users without the right role are redirected to their own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // While hydrating from localStorage, show nothing (avoids flash)
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#F5F6F8',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="rgba(114,75,104,0.2)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#724B68" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 14, color: '#4B5563', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Loading...
          </span>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to /login, preserve intended destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role → send to that user's own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <>{children}</>
}

/**
 * Opposite guard: redirect already-authenticated users away from
 * public pages (login / register) to their own dashboard.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <>{children}</>
}
