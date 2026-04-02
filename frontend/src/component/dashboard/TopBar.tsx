import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface Props { onMenuClick: () => void }

export default function TopBar({ onMenuClick }: Props) {
  const [dropOpen, setDropOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    setDropOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false); setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const notifications = [
    { text: '8 products are low on stock', time: '2m ago', dot: '#ef4444' },
    { text: 'New invoice INV-1024 created', time: '15m ago', dot: '#724B68' },
    { text: 'Monthly report is ready', time: '1h ago', dot: '#2563eb' },
  ]

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #E7E9ED',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      gap: 16, position: 'sticky', top: 0, zIndex: 9,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="topbar-menu-btn" style={{
        display: 'none', background: 'none', border: 'none',
        cursor: 'pointer', color: '#4B5563', padding: 4,
      }}>
        <Menu size={22} />
      </button>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input placeholder="Search invoices, products, customers…" style={{
          width: '100%', padding: '9px 14px 9px 38px', borderRadius: 10,
          border: '1.5px solid #E7E9ED', fontSize: 14, color: '#1F2933',
          background: '#F5F6F8', outline: 'none', fontFamily: 'Poppins, Inter, sans-serif',
          transition: 'border-color 0.2s', boxSizing: 'border-box',
        }}
          onFocus={e => e.target.style.borderColor = '#724B68'}
          onBlur={e => e.target.style.borderColor = '#E7E9ED'}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }} ref={dropRef}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setDropOpen(false) }} style={{
            position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
            width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#4B5563', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 46, width: 300,
              background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E7E9ED', fontWeight: 700, fontSize: 14, color: '#1F2933' }}>
                Notifications
              </div>
              {notifications.map((n, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', borderBottom: i < notifications.length - 1 ? '1px solid #F5F6F8' : 'none', cursor: 'pointer' }}
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
          <button onClick={() => { setDropOpen(!dropOpen); setNotifOpen(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none',
            border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#724B68', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div style={{ textAlign: 'left' }} className="profile-text">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>{user?.name || 'Admin User'}</div>
              <div style={{ fontSize: 11, color: '#4B5563' }}>{user?.role || 'Administrator'}</div>
            </div>
            <ChevronDown size={14} color="#4B5563" className="profile-text" />
          </button>

          {dropOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 50, width: 200,
              background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100,
            }}>
              {[
                { icon: User, label: 'Admin Profile', to: '/dashboard/profile' },
                { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
              ].map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to} onClick={() => setDropOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
                  textDecoration: 'none', color: '#1F2933', fontSize: 14,
                  borderBottom: '1px solid #F5F6F8', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <Icon size={15} color="#4B5563" /> {label}
                </Link>
              ))}
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
      </div>
    </header>
  )
}
