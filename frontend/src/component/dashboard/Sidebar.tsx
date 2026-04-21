import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Package, Users, BarChart2,
  UserCog, Settings, LogOut, Package2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard' },
  { icon: FileText,        label: 'Billing / Invoices', path: '/dashboard/invoices' },
  { icon: Package,         label: 'Inventory',        path: '/dashboard/inventory' },
  { icon: Users,           label: 'Customers',        path: '/dashboard/customers' },
  { icon: BarChart2,       label: 'Reports',          path: '/dashboard/reports' },
  { icon: UserCog,         label: 'User Management',  path: '/dashboard/users' },
  { icon: Settings,        label: 'Settings',         path: '/dashboard/settings' },
]

interface Props { collapsed: boolean; onToggle: () => void }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      minHeight: '100vh',
      background: '#5A3A52',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 16px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        gap: 10, overflow: 'hidden',
      }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package2 size={20} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', fontFamily: 'Poppins, Inter, sans-serif', whiteSpace: 'nowrap' }}>
            Inventra
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = pathname === path
          return (
            <Link key={path} to={path} title={collapsed ? label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 14px' : '10px 14px',
              borderRadius: 10, textDecoration: 'none',
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              fontWeight: active ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s', overflow: 'hidden', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a href="#" onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
          color: 'rgba(255,255,255,0.65)', fontSize: 14, whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </a>
      </div>

      {/* Collapse toggle */}
      <button onClick={onToggle} style={{
        position: 'absolute', top: 72, right: -12,
        width: 24, height: 24, borderRadius: '50%',
        background: '#724B68', border: '2px solid #F5F6F8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', padding: 0, zIndex: 20,
      }}>
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  )
}
