import { TrendingUp, FileText, AlertTriangle, ShoppingCart } from 'lucide-react'

function DashboardMockup() {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: 24,
      boxShadow: '0 20px 60px rgba(114,75,104,0.18)',
      border: '1px solid #E7E9ED', minWidth: 0,
      animation: 'float 4s ease-in-out infinite'
    }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 13, color: '#4B5563', fontWeight: 600 }}>Inventra Dashboard</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Revenue', value: '₹2.4L', color: '#724B68' },
          { label: 'Orders', value: '148', color: '#9B6F92' },
          { label: 'Stock', value: '1,240', color: '#5A3A52' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#F5F6F8', borderRadius: 10, padding: '12px 14px'
          }}>
            <div style={{ fontSize: 11, color: '#4B5563', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: '#F5F6F8', borderRadius: 12, padding: '14px 16px', marginBottom: 16
      }}>
        <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} color="#724B68" /> Sales Trend
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
              background: i === 11 ? '#724B68' : `rgba(114,75,104,${0.2 + i * 0.06})`,
              transition: 'height 0.3s'
            }} />
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} color="#724B68" /> Recent Invoices
        </div>
        {[
          { id: 'INV-1042', name: 'Ravi Constructions', amt: '₹18,400', status: 'Paid' },
          { id: 'INV-1041', name: 'Sharma Builders', amt: '₹9,200', status: 'Pending' },
        ].map(inv => (
          <div key={inv.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: '1px solid #E7E9ED', fontSize: 12
          }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1F2933' }}>{inv.id}</div>
              <div style={{ color: '#4B5563' }}>{inv.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#724B68' }}>{inv.amt}</div>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: inv.status === 'Paid' ? '#dcfce7' : '#fef9c3',
                color: inv.status === 'Paid' ? '#16a34a' : '#ca8a04'
              }}>{inv.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      <div style={{
        background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8,
        padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
      }}>
        <AlertTriangle size={14} color="#ea580c" />
        <span style={{ color: '#9a3412', fontWeight: 500 }}>3 items low on stock</span>
        <ShoppingCart size={12} color="#9a3412" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #F5F6F8 0%, #f0eaf4 100%)',
      padding: '80px 24px 100px'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center'
      }} className="hero-grid">
        {/* Left */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(114,75,104,0.1)', borderRadius: 20, padding: '6px 14px',
            marginBottom: 24, fontSize: 13, color: '#724B68', fontWeight: 600
          }}>
            🏗️ Built for Building Material Retailers
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#1F2933',
            lineHeight: 1.15, margin: '0 0 20px',
            fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-1px'
          }}>
            Smart Billing &amp; Inventory Management
            <span style={{ color: '#724B68' }}> for Building Material Businesses</span>
          </h1>
          <p style={{
            fontSize: 18, color: '#4B5563', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 480
          }}>
            Automate billing, manage inventory, calculate GST, and track sales — all in one simple platform.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href="#get-started" style={{
              background: '#724B68', color: '#fff', padding: '14px 32px',
              borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(114,75,104,0.35)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Start Free Trial</a>
            <a href="#demo" style={{
              background: '#fff', color: '#724B68', padding: '14px 32px',
              borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none',
              border: '2px solid #724B68', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0eaf4' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >View Demo</a>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[['500+', 'Retailers'], ['10K+', 'Invoices/day'], ['99.5%', 'Uptime']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#724B68' }}>{v}</div>
                <div style={{ fontSize: 13, color: '#4B5563' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Dashboard mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }} className="hero-mockup">
          <div style={{ width: '100%', maxWidth: 420 }}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
