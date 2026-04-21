import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FilePlus, FileText, Users, Package,
  LogOut, Package2, ChevronLeft, ChevronRight, Menu, User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/staff' },
  { icon: FilePlus,        label: 'Create Invoice',  path: '/staff/create-invoice' },
  { icon: FileText,        label: 'Invoice History', path: '/staff/invoices' },
  { icon: Users,           label: 'Customers',       path: '/staff/customers' },
  { icon: Package,         label: 'Products',        path: '/staff/products' },
]

function StaffSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
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
      background: 'linear-gradient(180deg, #4A2E42 0%, #5A3A52 100%)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package2 size={18} color="#fff" />
        </div>
        {!collapsed && <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.3px' }}>Inventra</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = pathname === path || (path !== '/staff' && pathname.startsWith(path))
          return (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, textDecoration: 'none',
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              fontWeight: active ? 700 : 500,
              fontSize: 14, fontFamily: 'Poppins, Inter, sans-serif',
              transition: 'all 0.15s',
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

      {/* Collapse toggle */}
      <button onClick={onToggle} style={{
        margin: '8px', padding: '8px', borderRadius: 8, border: 'none',
        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logout */}
      <a href="#" onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '14px 0' : '14px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: '#fca5a5', fontSize: 14, fontWeight: 600,
        textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.08)',
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
        onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
      >
        <LogOut size={18} style={{ flexShrink: 0 }} />
        {!collapsed && 'Logout'}
      </a>
    </aside>
  )
}

function StaffTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [dropOpen, setDropOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    setDropOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #E7E9ED',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 9, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <button onClick={onMenuClick} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 4 }} className="staff-menu-btn">
        <Menu size={22} />
      </button>

      <div style={{ marginLeft: 'auto', position: 'relative' }}>
        <button onClick={() => setDropOpen(!dropOpen)} style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'none',
          border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#5A3A52', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>{user?.name || 'Staff'}</div>
            <div style={{ fontSize: 11, color: '#4B5563' }}>Staff</div>
          </div>
        </button>

        {dropOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 50, width: 180,
            background: '#fff', borderRadius: 12, border: '1px solid #E7E9ED',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100,
          }}>
            <Link to="/staff/profile" onClick={() => setDropOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
              textDecoration: 'none', color: '#1F2933', fontSize: 14,
              borderBottom: '1px solid #F5F6F8', transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <User size={15} color="#4B5563" /> My Profile
            </Link>
            <a href="#" onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
              textDecoration: 'none', color: '#ef4444', fontSize: 14, transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <LogOut size={15} /> Logout
            </a>
          </div>
        )}
      </div>
    </header>
  )
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6F8', fontFamily: 'Poppins, Inter, sans-serif' }}>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 15 }}
        />
      )}
      <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <StaffSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <StaffTopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .staff-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
