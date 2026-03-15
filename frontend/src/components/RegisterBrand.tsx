import { Package, BarChart2, FileText, Boxes } from 'lucide-react'

const inventoryItems = [
  { name: 'Portland Cement', stock: 240, color: '#724B68' },
  { name: 'TMT Steel Bars', stock: 18, color: '#ef4444' },
  { name: 'Red Bricks', stock: 1500, color: '#724B68' },
]

export default function RegisterBrand() {
  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(145deg, #724B68 0%, #5A3A52 55%, #3d2438 100%)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '60px 48px', position: 'relative',
      overflow: 'hidden', minHeight: '100svh',
    }} className="login-brand">

      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, alignSelf: 'flex-start' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <Package size={24} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 26, color: '#fff', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Inventra</span>
      </div>

      {/* Headline */}
      <div style={{ alignSelf: 'flex-start', marginBottom: 36, maxWidth: 400 }}>
        <h1 style={{ fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.2, fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
          Start Managing Your Retail Business Smarter
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>
          Create an account to automate billing, track inventory, generate GST invoices, and monitor sales performance.
        </p>
      </div>

      {/* Floating illustration */}
      <div style={{ animation: 'float 4s ease-in-out infinite', width: '100%', maxWidth: 400, marginBottom: 36 }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: 22, border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

          {/* Window dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Inventra Dashboard</span>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {[{ icon: BarChart2, label: 'Revenue', val: '₹2.4L' }, { icon: FileText, label: 'Invoices', val: '142' }, { icon: Boxes, label: 'Products', val: '340' }].map(({ icon: Icon, label, val }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 10px' }}>
                <Icon size={14} color="rgba(255,255,255,0.7)" />
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 600 }}>Sales Chart</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 40 }}>
              {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0', background: i === 11 ? 'rgba(255,255,255,0.9)' : `rgba(255,255,255,${0.18 + i * 0.05})` }} />
              ))}
            </div>
          </div>

          {/* Inventory list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Inventory Status</div>
            {inventoryItems.map(item => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{item.name}</span>
                  <span style={{ fontSize: 10, color: item.stock < 50 ? '#fca5a5' : 'rgba(255,255,255,0.6)' }}>{item.stock < 50 ? '⚠ Low' : item.stock}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${Math.min((item.stock / 300) * 100, 100)}%`, background: item.stock < 50 ? '#ef4444' : 'rgba(255,255,255,0.7)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product icons row */}
      <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {['🧱 Bricks', '🪨 Cement', '🔩 Steel', '🪵 Timber'].map(item => (
          <div key={item} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
