import { TrendingUp, Package, AlertTriangle, ShoppingCart, ArrowUpRight } from 'lucide-react'

const inventory = [
  { name: 'Portland Cement', stock: 240, max: 300, low: false },
  { name: 'TMT Steel Bars', stock: 18, max: 200, low: true },
  { name: 'Red Bricks', stock: 1500, max: 2000, low: false },
  { name: 'River Sand', stock: 12, max: 100, low: true },
]

const orders = [
  { id: 'ORD-2041', customer: 'Ravi Constructions', items: 5, total: '₹42,800', status: 'Delivered' },
  { id: 'ORD-2040', customer: 'Sharma Builders', items: 3, total: '₹18,200', status: 'Processing' },
  { id: 'ORD-2039', customer: 'Kumar & Sons', items: 8, total: '₹67,500', status: 'Delivered' },
]

export default function DashboardPreview() {
  return (
    <section id="dashboard" style={{ background: '#fff', padding: '90px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(114,75,104,0.1)', borderRadius: 20, padding: '6px 14px',
            marginBottom: 16, fontSize: 13, color: '#724B68', fontWeight: 600
          }}>📊 Dashboard</div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, color: '#1F2933',
            margin: '0 0 16px', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px'
          }}>All Your Business Data in One Dashboard</h2>
          <p style={{ fontSize: 17, color: '#4B5563', maxWidth: 500, margin: '0 auto' }}>
            Real-time insights, inventory tracking, and order management at a glance.
          </p>
        </div>

        {/* Dashboard card */}
        <div style={{
          background: '#F5F6F8', borderRadius: 24, padding: 32,
          border: '1px solid #E7E9ED',
          boxShadow: '0 8px 40px rgba(114,75,104,0.12)'
        }}>
          {/* Top stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, marginBottom: 24
          }}>
            {[
              { label: 'Total Revenue', value: '₹12.4L', change: '+18%', icon: TrendingUp },
              { label: 'Total Orders', value: '1,248', change: '+12%', icon: ShoppingCart },
              { label: 'Products', value: '342', change: '+5%', icon: Package },
              { label: 'Low Stock', value: '8 items', change: 'Alert', icon: AlertTriangle, alert: true },
            ].map(({ label, value, change, icon: Icon, alert }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: 14, padding: '18px 20px',
                border: `1px solid ${alert ? '#fed7aa' : '#E7E9ED'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: alert ? '#ea580c' : '#1F2933' }}>{value}</div>
                  </div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: alert ? '#fff7ed' : 'rgba(114,75,104,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={18} color={alert ? '#ea580c' : '#724B68'} />
                  </div>
                </div>
                <div style={{
                  marginTop: 8, fontSize: 12, fontWeight: 600,
                  color: alert ? '#ea580c' : '#16a34a',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  {!alert && <ArrowUpRight size={12} />}{change}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-grid">
            {/* Sales chart */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E7E9ED' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#724B68" /> Monthly Sales
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {[55, 70, 45, 85, 60, 90, 75, 95, 65, 100, 80, 88].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0',
                      background: i === 11 ? '#724B68' : `rgba(114,75,104,${0.15 + i * 0.05})`
                    }} />
                    {i % 3 === 0 && <span style={{ fontSize: 9, color: '#4B5563' }}>
                      {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                    </span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E7E9ED' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="#724B68" /> Inventory Status
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inventory.map(item => (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#1F2933', fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: item.low ? '#ea580c' : '#4B5563', fontWeight: 600 }}>
                        {item.low ? '⚠ Low' : item.stock}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${(item.stock / item.max) * 100}%`,
                        background: item.low ? '#ef4444' : '#724B68',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E7E9ED', marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={16} color="#724B68" /> Recent Orders
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E7E9ED' }}>
                    {['Order ID', 'Customer', 'Items', 'Total', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#4B5563', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F5F6F8' }}>
                      <td style={{ padding: '10px 12px', color: '#724B68', fontWeight: 600 }}>{o.id}</td>
                      <td style={{ padding: '10px 12px', color: '#1F2933' }}>{o.customer}</td>
                      <td style={{ padding: '10px 12px', color: '#4B5563' }}>{o.items}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1F2933' }}>{o.total}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: o.status === 'Delivered' ? '#dcfce7' : '#fef9c3',
                          color: o.status === 'Delivered' ? '#16a34a' : '#ca8a04'
                        }}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
