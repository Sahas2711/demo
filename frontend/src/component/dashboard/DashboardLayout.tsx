import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface Props { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6F8', fontFamily: 'Poppins, Inter, sans-serif' }} className="dashboard-main">
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 15 }}
          className="sidebar-overlay"
        />
      )}
      <div className={`sidebar-wrapper ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
