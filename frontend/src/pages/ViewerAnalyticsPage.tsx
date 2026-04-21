import { useState, useEffect } from 'react'
import { TrendingUp, IndianRupee, ShoppingCart, Users, Package, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import { billingApi } from '../api/billingApi'
import { customerApi } from '../api/customerApi'
import { inventoryApi } from '../api/inventoryApi'
import type { InvoiceResponse, ProductResponse } from '../api/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E7E9ED',
  borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}
const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px',
  whiteSpace: 'nowrap', background: '#F5F6F8',
}

function cardHead(title: string, sub: string, badge?: React.ReactNode) {
  return (
    <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>{title}</h3>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>{sub}</p>
      </div>
      {badge}
    </div>
  )
}

function LineChart({ data }: { data: { label: string; sales: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const W = 500, H = 140, PX = 24, PY = 16
  const max = Math.max(...data.map(d => d.sales), 1)
  const pts = data.map((d, i) => ({
    x: PX + (i / Math.max(data.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - d.sales / max) * (H - PY * 2),
    ...d,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140 }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#724B68" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#724B68" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg)" />
      <path d={path} fill="none" stroke="#724B68" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={p.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
          <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 4} fill="#724B68" style={{ transition: 'r 0.15s' }} />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">{p.label}</text>
          {hovered === i && (
            <g>
              <rect x={p.x - 36} y={p.y - 30} width={72} height={22} rx={6} fill="#1F2933" />
              <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="700">
                ₹{(p.sales / 1000).toFixed(0)}k
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function ViewerAnalyticsPage() {
  const [invoices, setInvoices]         = useState<InvoiceResponse[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [lowStockItems, setLowStockItems] = useState<ProductResponse[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [invRes, custRes, lowRes] = await Promise.all([
          billingApi.getInvoices({ size: 500 }),
          customerApi.getCustomers({ size: 1 }),
          inventoryApi.getLowStockProducts(),
        ])
        setInvoices(invRes.data.content)
        setCustomerCount(custRes.data.totalElements)
        setLowStockItems(lowRes.data)
      } catch { /* handled by interceptor */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // Derived data
  const totalSales  = invoices.reduce((s, i) => s + i.grandTotal, 0)
  const totalOrders = invoices.length

  const monthlyMap: Record<string, number> = {}
  for (const inv of invoices) {
    const m = MONTHS[new Date(inv.createdAt).getMonth()]
    monthlyMap[m] = (monthlyMap[m] ?? 0) + inv.grandTotal
  }
  const monthlyData = MONTHS.filter(m => monthlyMap[m]).map(m => ({ label: m, sales: monthlyMap[m] }))

  // Top customers by spend
  const custMap = new Map<string, { total: number; orders: number }>()
  for (const inv of invoices) {
    const cur = custMap.get(inv.customerName) ?? { total: 0, orders: 0 }
    custMap.set(inv.customerName, { total: cur.total + inv.grandTotal, orders: cur.orders + 1 })
  }
  const topCustomers = Array.from(custMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Top products by revenue (from invoice items)
  const prodMap = new Map<string, { units: number; revenue: number }>()
  for (const inv of invoices) {
    for (const item of inv.items) {
      const cur = prodMap.get(item.productName) ?? { units: 0, revenue: 0 }
      prodMap.set(item.productName, { units: cur.units + item.quantity, revenue: cur.revenue + item.totalPrice })
    }
  }
  const topProducts = Array.from(prodMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  const maxRevenue = Math.max(...topProducts.map(p => p.revenue), 1)

  const cgst = invoices.reduce((s, i) => s + i.cgst, 0)
  const sgst = invoices.reduce((s, i) => s + i.sgst, 0)
  const igst = invoices.reduce((s, i) => s + i.igst, 0)
  const gstTotal = cgst + sgst + igst

  const SUMMARY_CARDS = [
    { label: 'Total Sales',   value: loading ? '…' : `₹${totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,  icon: TrendingUp,   color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
    { label: 'Total Revenue', value: loading ? '…' : `₹${(totalSales * 0.82).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, icon: IndianRupee, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.15)' },
    { label: 'Total Orders',  value: loading ? '…' : `${totalOrders}`,  icon: ShoppingCart, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)' },
    { label: 'Customers',     value: loading ? '…' : `${customerCount}`, icon: Users,       color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)' },
  ]

  return (
    <ViewerLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Business performance overview.</p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 16 }}>
        {SUMMARY_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: color, borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color="#fff" />
                </div>
                <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</span>
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 6 }}>{value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#059669' }}>
              <ArrowUpRight size={13} /> Live data
            </div>
          </div>
        ))}
      </div>

      {/* Sales Over Time */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {cardHead('Sales Over Time', 'Monthly view')}
        <div style={{ padding: '16px 20px' }}>
          {loading
            ? <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading…</div>
            : <LineChart data={monthlyData.length ? monthlyData : [{ label: 'No data', sales: 0 }]} />}
        </div>
      </div>

      {/* Top Customers + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Top Customers', 'By total purchase value',
            <span style={{ fontSize: 11, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> {topCustomers.length} customers
            </span>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['#', 'Customer', 'Orders', 'Total Purchase'].map(h => (
                <th key={h} style={{ ...thStyle, textAlign: h === 'Total Purchase' ? 'right' : 'left' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : topCustomers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No data yet.</td></tr>
              ) : topCustomers.map((c, i) => (
                <tr key={c.name} style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(114,75,104,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '11px 16px', fontWeight: 700, color: '#9ca3af', width: 32 }}>{i + 1}</td>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1F2933' }}>{c.name}</td>
                  <td style={{ padding: '11px 16px', color: '#4B5563' }}>{c.orders}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: '#724B68' }}>₹{c.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Top Selling Products', 'By revenue generated',
            <span style={{ fontSize: 11, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Package size={11} /> {topProducts.length} products
            </span>
          )}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loading ? <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Loading…</div>
              : topProducts.length === 0 ? <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No data yet.</div>
              : topProducts.map((p, i) => {
                const pct = (p.revenue / maxRevenue) * 100
                const colors = ['#724B68', '#2563eb', '#059669', '#ca8a04', '#7c3aed']
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', width: 16 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{p.units} units</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* GST Insights + Inventory Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('GST Insights', 'CGST / SGST / IGST breakdown')}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'CGST', value: cgst, color: '#724B68', bg: 'rgba(114,75,104,0.08)' },
                { label: 'SGST', value: sgst, color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
                { label: 'IGST', value: igst, color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
              ].map(g => (
                <div key={g.label} style={{ background: g.bg, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: g.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{g.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: g.color, fontFamily: 'Poppins, Inter, sans-serif' }}>
                    {loading ? '…' : g.value > 0 ? `₹${g.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(114,75,104,0.06)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>Total GST Collected</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#724B68', fontFamily: 'Poppins, Inter, sans-serif' }}>
                {loading ? '…' : `₹${gstTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Inventory Insights', 'Stock alerts and low inventory',
            <span style={{ fontSize: 11, background: 'rgba(202,138,4,0.1)', color: '#ca8a04', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11} /> {lowStockItems.length} alerts
            </span>
          )}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Loading…</div>
              : lowStockItems.length === 0 ? <div style={{ color: '#059669', textAlign: 'center', padding: '20px', fontWeight: 600 }}>All items well stocked.</div>
              : lowStockItems.slice(0, 5).map(item => {
                const critical = item.quantityAvailable <= 10
                const pct = Math.min((item.quantityAvailable / item.reorderLevel) * 100, 100)
                return (
                  <div key={item.id}
                    style={{ background: critical ? 'rgba(220,38,38,0.03)' : 'rgba(202,138,4,0.03)', border: `1px solid ${critical ? 'rgba(220,38,38,0.12)' : 'rgba(202,138,4,0.12)'}`, borderRadius: 10, padding: '12px 14px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{item.name}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{item.category.name}</span>
                      </div>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: critical ? 'rgba(220,38,38,0.1)' : 'rgba(202,138,4,0.1)', color: critical ? '#dc2626' : '#ca8a04' }}>
                        {critical ? 'Critical' : 'Low Stock'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: critical ? '#dc2626' : '#ca8a04', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: critical ? '#dc2626' : '#ca8a04', whiteSpace: 'nowrap' }}>
                        {item.quantityAvailable} / {item.reorderLevel}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .tables-grid { grid-template-columns: 1fr !important; } }`}</style>
    </ViewerLayout>
  )
}
