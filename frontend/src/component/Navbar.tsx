import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Package } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '1px solid #E7E9ED',
      boxShadow: '0 1px 8px rgba(114,75,104,0.07)'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            background: '#724B68', borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Package size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Inventra
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
          {['Features', 'Pricing', 'About'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              color: '#4B5563', textDecoration: 'none', fontSize: 15, fontWeight: 500,
              transition: 'color 0.2s'
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#724B68')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
            >{l}</a>
          ))}
          <Link to="/login" style={{
            color: '#724B68', textDecoration: 'none', fontSize: 15, fontWeight: 500
          }}>Login</Link>
          <Link to="/login" style={{
            background: '#724B68', color: '#fff', padding: '9px 22px',
            borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(114,75,104,0.25)',
            transition: 'background 0.2s, transform 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          >Get Started</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#1F2933'
        }} className="nav-toggle">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: '#fff', borderTop: '1px solid #E7E9ED',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16
        }} className="mobile-menu">
          {['Features', 'Pricing', 'About'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} style={{
              color: '#4B5563', textDecoration: 'none', fontSize: 16, fontWeight: 500
            }}>{l}</a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} style={{
            color: '#724B68', textDecoration: 'none', fontSize: 16, fontWeight: 500
          }}>Login</Link>
          <Link to="/login" onClick={() => setOpen(false)} style={{
            background: '#724B68', color: '#fff', padding: '10px 20px',
            borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center'
          }}>Get Started</Link>
        </div>
      )}
    </nav>
  )
}
