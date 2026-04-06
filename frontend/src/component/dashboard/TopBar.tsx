import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

interface LowStockProduct { id: string; name: string; quantityAvailable: number }
interface Props { onMenuClick: () => void }

export default function TopBar({ onMenuClick }: Props) {
  const [dropOpen, setDropOpen]       = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [lowStock, setLowStock]       = useState<LowStockProduct[]>([])
  const dropRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault()
    setDropOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  // Fetch low stock alerts on mount
  useEffect(() => {
    api.get<LowStockProduct[]>('/v1/inventory/low-stock')
      .then(res => setLowStock(res.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false); setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            {lowStock.length > 0 && (
              <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 46, width: 300,
              background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1F2933' }}>Low Stock Alerts</span>
                {lowStock.length > 0 && (
                  <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                    {lowStock.length} items
                  </span>
                )}
              </div>
              {lowStock.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                  ✅ All stock levels are healthy
                </div>
              ) : (
                <>
                  {lowStock.slice(0, 6).map((p, i) => (
                    <div key={p.id} style={{ padding: '11px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: i < Math.min(lowStock.length, 6) - 1 ? '1px solid #F5F6F8' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.quantityAvailable === 0 ? '#dc2626' : '#f97316', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#1F2933', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: p.quantityAvailable === 0 ? '#dc2626' : '#f97316', marginTop: 1, fontWeight: 600 }}>
                          {p.quantityAvailable === 0 ? 'Out of stock' : `${p.quantityAvailable} units left`}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/dashboard/inventory" onClick={() => setNotifOpen(false)} style={{
                    display: 'block', padding: '11px 16px', textAlign: 'center',
                    fontSize: 13, fontWeight: 600, color: '#724B68', textDecoration: 'none',
                    borderTop: '1px solid #F5F6F8', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf9fc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    View all in Inventory →
                  </Link>
                </>
              )}
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
