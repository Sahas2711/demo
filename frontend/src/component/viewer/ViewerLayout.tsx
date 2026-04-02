import { useState, type ReactNode, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, BarChart2, LineChart,
  LogOut as LogOutIcon, Package2, ChevronLeft, ChevronRight,
  Menu, Search, Bell, ChevronDown, User, Calculator,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/viewer' },
  { icon: FileText, label: 'Invoices', path: '/viewer/invoices' },
  { icon: BarChart2, label: 'Reports', path: '/viewer/reports' },
  { icon: LineChart, label: 'Analytics', path: '/viewer/analytics' },
  { icon: Calculator, label: 'GST Calculator', path: '/viewer/gst-calculator' },
]

function ViewerSidebar({ collapsed }) {
  const { pathname } = useLocation()

  return (
    <aside style={{ width: collapsed ? 68 : 240, background: '#5A3A52' }}>
      {NAV.map(({ icon: Icon, label, path }) => {
        const active = pathname === path
        return (
          <Link key={path} to={path} style={{ display: 'flex', gap: 10, padding: 10, color: active ? '#fff' : '#ccc' }}>
            <Icon size={18} />
            {!collapsed && label}
          </Link>
        )
      })}
    </aside>
  )
}

function ViewerTopBar({ onMenuClick }) {
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
          {user?.name || 'Viewer'}
        </button>

        {dropOpen && (
          <div style={{ position: 'absolute', right: 20, background: '#fff', border: '1px solid #ddd' }}>
            <Link to="/viewer/profile">Profile</Link>

            <a href="#" onClick={handleLogout}>
              <LogOutIcon size={14} /> Logout
            </a>
          </div>
        )}
      </div>
    </header>
  )
}

export default function ViewerLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex' }}>
      <ViewerSidebar collapsed={collapsed} />
      <div style={{ flex: 1 }}>
        <ViewerTopBar onMenuClick={() => {}} />
        <main>{children}</main>
      </div>
    </div>
  )
}