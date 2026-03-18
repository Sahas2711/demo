import { Package, TrendingUp, FileText, ShieldCheck } from 'lucide-react'

const stats = [
  { label: 'Revenue Today', value: '₹84,200', up: true },
  { label: 'Invoices', value: '142', up: true },
  { label: 'Low Stock', value: '3 items', up: false },
]

const features = [
  { icon: FileText, text: 'GST-compliant billing in seconds' },
  { icon: TrendingUp, text: 'Real-time sales & inventory insights' },
  { icon: ShieldCheck, text: 'Secure role-based access control' },
]

export default function LoginBrand() {
  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(145deg, #724B68 0%, #5A3A52 55%, #3d2438 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 48px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100svh',
    }} className="login-brand">

      {/* Background decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, alignSelf: 'flex-start' }}>
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 12,
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <Package size={24} color="#fff" />
        </div>
        <span style={{
          fontWeight: 800, fontSize: 26, color: '#fff',
          fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px'
        }}>Inventra</span>
      </div>

      {/* Headline */}
      <div style={{ alignSelf: 'flex-start', marginBottom: 40, maxWidth: 400 }}>
        <h1 style={{
          fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff',
          margin: '0 0 16px', lineHeight: 1.2,
          fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px'
        }}>
          Smart Retail Billing &amp; Inventory Management
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>
          Manage GST billing, track inventory, and monitor sales from one powerful dashboard.
        </p>
      </div>

      {/* Floating dashboard mockup */}
      <div style={{ animation: 'float 4s ease-in-out infinite', width: '100%', maxWidth: 400, marginBottom: 40 }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
          borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
        }}>
          {/* Window dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              Dashboard Overview
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
            {stats.map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px'
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: s.up ? '#86efac' : '#fca5a5', marginTop: 2 }}>
                  {s.up ? '▲ +12%' : '▼ Alert'}
                </div>
              </div>
            ))}
          </div>

          {/* Mini bar chart */}
          <div style={{
            background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10, fontWeight: 600 }}>
              Weekly Sales
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44 }}>
              {[50, 70, 40, 85, 60, 90, 75].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0',
                  background: i === 5 ? 'rgba(255,255,255,0.9)' : `rgba(255,255,255,${0.2 + i * 0.07})`
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
        {features.map(({ icon: Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={16} color="rgba(255,255,255,0.9)" />
            </div>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
