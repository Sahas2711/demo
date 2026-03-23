import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, BarChart2, LogOut,
  Package2, ChevronLeft, ChevronRight, Menu,
  Search, Bell, ChevronDown, User, LogOut as LogOutIcon,
} from 'lucide-react'
import { useRef, useEffect } from 'react'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/viewer' },
  { icon: FileText,        label: 'Invoices',  path: '/viewer/invoices' },
  { icon: BarChart2,       label: 'Reports',   path: '/viewer/reports' },
]

function ViewerSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { pathname } = useLocation()
  return (
    <aside style={{
      width: collapsed ? 68 : 240, minHeight: '100vh',
      background: '#5A3A52', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease', flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: collapsed ? '0 16px' : '0 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: 10, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package2 size={20} color="#fff" />
        </div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', fontFamily: 'Poppins, Inter, sans-serif', whiteSpace: 'nowrap' }}>Inventra</span>}
      </div>

      {/* Viewer badge */}
      {!collapsed && (
        <div style={{ margin: '12px 12px 4px', background: 'rgba(5,150,105,0.15)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.5px' }}>VIEWER ACCESS</span>
        </div>
      )}

      <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = pathname === path
          return (
            <Link key={path} to={path} title={collapsed ? label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
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

      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, whiteSpace: 'nowrap', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </Link>
      </div>

      <button onClick={onToggle} style={{ position: 'absolute', top: 72, right: -12, width: 24, height: 24, borderRadius: '50%', background: '#724B68', border: '2px solid #F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0, zIndex: 20 }}>
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  )
}

function ViewerTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [dropOpen, setDropOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setDropOpen(false); setNotifOpen(false) }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const notifs = [
    { text: 'Monthly report is ready', time: '1h ago', dot: '#2563eb' },
    { text: 'GST summary updated', time: '3h ago', dot: '#059669' },
  ]

  return (
    <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #E7E9ED', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 9, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button onClick={onMenuClick} className="topbar-menu-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 4 }}>
        <Menu size={22} />
      </button>
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input placeholder="Search invoices, reports…" style={{ width: '100%', padding: '9px 14px 9px 38px', borderRadius: 10, border: '1.5px solid #E7E9ED', fontSize: 14, color: '#1F2933', background: '#F5F6F8', outline: 'none', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#059669'}
          onBlur={e => e.target.style.borderColor = '#E7E9ED'}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }} ref={ref}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false) }} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#059669', border: '2px solid #fff' }} />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', right: 0, top: 46, width: 280, background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E7E9ED', fontWeight: 700, fontSize: 14, color: '#1F2933' }}>Notifications</div>
              {notifs.map((n, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: i < notifs.length - 1 ? '1px solid #F5F6F8' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, color: '#1F2933', fontWeight: 500 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 10, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>V</div>
            <div style={{ textAlign: 'left' }} className="profile-text">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>Viewer User</div>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Read Only</div>
            </div>
            <ChevronDown size={14} color="#4B5563" className="profile-text" />
          </button>
          {dropOpen && (
            <div style={{ position: 'absolute', right: 0, top: 50, width: 180, background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid #F5F6F8', color: '#1F2933', fontSize: 14 }}>
                <User size={15} color="#4B5563" /> Profile
              </div>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', textDecoration: 'none', color: '#ef4444', fontSize: 14, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <LogOutIcon size={15} /> Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

interface Props { children: ReactNode }

export default function ViewerLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6F8', fontFamily: 'Poppins, Inter, sans-serif' }}>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 15 }}
          className="sidebar-overlay"
        />
      )}
      <div className={`sidebar-wrapper ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <ViewerSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ViewerTopBar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
