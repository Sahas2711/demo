import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FilePlus, FileText, Users, Package,
  LogOut, Package2, ChevronLeft, ChevronRight, Bell,
  ChevronDown, User, Menu, Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
  { icon: FilePlus, label: 'Create Invoice', path: '/staff/create-invoice' },
  { icon: FileText, label: 'Invoice History', path: '/staff/invoices' },
  { icon: Users, label: 'Customers', path: '/staff/customers' },
  { icon: Package, label: 'Products', path: '/staff/products' },
]

function StaffSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e) {
    e.preventDefault()
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside style={{ width: collapsed ? 68 : 240, minHeight: '100vh', background: '#5A3A52', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: 16 }}>
        <Package2 color="#fff" />
        {!collapsed && <span style={{ color: '#fff', marginLeft: 10 }}>Inventra</span>}
      </div>

      <nav style={{ flex: 1 }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = pathname === path
          return (
            <Link key={path} to={path} style={{ display: 'flex', gap: 10, padding: 10, color: active ? '#fff' : '#ccc' }}>
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      <a href="#" onClick={handleLogout} style={{ padding: 10, color: '#fca5a5' }}>
        <LogOut size={18} /> {!collapsed && 'Logout'}
      </a>
    </aside>
  )
}

function StaffTopBar({ onMenuClick }) {
  const [dropOpen, setDropOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e) {
    e.preventDefault()
    setDropOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header style={{ height: 64, background: '#fff', display: 'flex', alignItems: 'center', padding: 20 }}>
      <button onClick={onMenuClick}><Menu /></button>

      <div style={{ marginLeft: 'auto' }}>
        <button onClick={() => setDropOpen(!dropOpen)}>
          {user?.name || 'Staff'}
        </button>

        {dropOpen && (
          <div style={{ position: 'absolute', right: 20, background: '#fff', border: '1px solid #ddd' }}>
            <Link to="/staff/profile">My Profile</Link>

            <a href="#" onClick={handleLogout}>
              Logout
            </a>
          </div>
        )}
      </div>
    </header>
  )
}

export default function StaffLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex' }}>
      <StaffSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1 }}>
        <StaffTopBar onMenuClick={() => {}} />
        <main>{children}</main>
      </div>
    </div>
  )
}