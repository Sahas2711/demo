import { useState } from 'react'
import { TrendingUp, IndianRupee, ShoppingCart, Users, Package, AlertTriangle, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import { SALES_DATA, GST_SUMMARY, LOW_STOCK_ITEMS, MONTHLY_TREND } from '../component/reports/reportsData'

// ── Derived data ──────────────────────────────────────────────
const WEEKLY_TREND = [
  { label: 'W1', sales: 28000, expenses: 18000 },
  { label: 'W2', sales: 34000, expenses: 21000 },
  { label: 'W3', sales: 41000, expenses: 24000 },
  { label: 'W4', sales: 43500, expenses: 26000 },
]

const TOP_CUSTOMERS = Array.from(
  SALES_DATA.reduce((map, r) => {
    const cur = map.get(r.customer) ?? { total: 0, orders: 0 }
    map.set(r.customer, { total: cur.total + r.amount, orders: cur.orders + 1 })
    return map
  }, new Map<string, { total: number; orders: number }>())
).map(([name, d]) => ({ name, ...d }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5)

const TOP_PRODUCTS = [
  { name: 'TMT Steel Bars',  units: 8,  revenue: 46400 },
  { name: 'Portland Cement', units: 30, revenue: 14800 },
  { name: 'Steel Rods',      units: 3,  revenue: 19200 },
  { name: 'Granite Tiles',   units: 10, revenue: 12000 },
  { name: 'PVC Pipes',       units: 11, revenue:  4200 },
]

const maxRevenue = Math.max(...TOP_PRODUCTS.map(p => p.revenue))
const gstTotal   = GST_SUMMARY.cgst + GST_SUMMARY.sgst + GST_SUMMARY.igst

// ── Shared styles ─────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E7E9ED',
  borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}
const cardHead = (title: string, sub: string, badge?: React.ReactNode) => (
  <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
    <div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>{title}</h3>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>{sub}</p>
    </div>
    {badge}
  </div>
)
const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px',
  whiteSpace: 'nowrap', background: '#F5F6F8',
}

// ── SVG Line Chart ────────────────────────────────────────────
function LineChart({ data }: { data: { label: string; sales: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const W = 500, H = 140, PX = 24, PY = 16
  const max = Math.max(...data.map(d => d.sales))
  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - PX * 2),
    y: PY + (1 - d.sales / max) * (H - PY * 2),
    ...d,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`

  return (
    <div style={{ position: 'relative' }}>
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
    </div>
  )
}

// ── SVG Bar Chart (Revenue vs Expenses) ──────────────────────
function BarChart({ data }: { data: { label: string; sales: number; expenses: number }[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const W = 500, H = 140, PX = 24, PY = 16
  const max = Math.max(...data.flatMap(d => [d.sales, d.expenses]))
  const slotW = (W - PX * 2) / data.length
  const bw = slotW * 0.28

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140 }}>
      {data.map((d, i) => {
        const cx = PX + i * slotW + slotW / 2
        const sh = ((d.sales / max) * (H - PY * 2))
        const eh = ((d.expenses / max) * (H - PY * 2))
        const key = `${d.label}`
        return (
          <g key={key} onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
            <rect x={cx - bw - 2} y={H - PY - sh} width={bw} height={sh} rx={4}
              fill={hovered === key ? '#5A3A52' : '#724B68'} style={{ transition: 'fill 0.15s' }} />
            <rect x={cx + 2} y={H - PY - eh} width={bw} height={eh} rx={4}
              fill={hovered === key ? '#1d4ed8' : '#93c5fd'} style={{ transition: 'fill 0.15s' }} />
            <text x={cx} y={H - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.label}</text>
            {hovered === key && (
              <g>
                <rect x={cx - 44} y={PY} width={88} height={36} rx={6} fill="#1F2933" />
                <text x={cx} y={PY + 13} textAnchor="middle" fontSize={9} fill="#fff">Rev ₹{(d.sales / 1000).toFixed(0)}k</text>
                <text x={cx} y={PY + 26} textAnchor="middle" fontSize={9} fill="#93c5fd">Exp ₹{(d.expenses / 1000).toFixed(0)}k</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function ViewerAnalyticsPage() {
  const [chartRange, setChartRange] = useState<'Weekly' | 'Monthly'>('Monthly')

  const chartData = chartRange === 'Monthly'
    ? MONTHLY_TREND.map(d => ({ label: d.month, sales: d.sales }))
    : WEEKLY_TREND.map(d => ({ label: d.label, sales: d.sales }))

  const totalSales   = SALES_DATA.reduce((s, r) => s + r.amount, 0)
  const totalOrders  = SALES_DATA.length
  const prevSales    = 120000
  const growthPct    = (((totalSales - prevSales) / prevSales) * 100).toFixed(1)
  const isGrowthUp   = totalSales >= prevSales

  const SUMMARY_CARDS = [
    { label: 'Total Sales',    value: `₹${totalSales.toLocaleString()}`,  trend: '+18.2%', up: true,  icon: TrendingUp,   color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
    { label: 'Total Revenue',  value: `₹${(totalSales * 0.82).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, trend: '+12.4%', up: true, icon: IndianRupee, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.15)' },
    { label: 'Total Orders',   value: `${totalOrders}`,                   trend: '+5.0%',  up: true,  icon: ShoppingCart, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)'  },
    { label: 'Growth',         value: `${growthPct}%`,                    trend: isGrowthUp ? `↑ vs last month` : `↓ vs last month`, up: isGrowthUp, icon: TrendingUp, color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)' },
  ]

  return (
    <ViewerLayout>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Business performance overview — May 2024.
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      {/* ── 1. Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 16 }}>
        {SUMMARY_CARDS.map(({ label, value, trend, up, icon: Icon, color, bg, border }) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: up ? '#059669' : '#dc2626' }}>
              {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Sales Over Time + Revenue vs Expenses ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* Line chart */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Sales Over Time', `${chartRange} view — 2024`,
            <div style={{ display: 'flex', background: '#F5F6F8', borderRadius: 8, padding: 3, gap: 3 }}>
              {(['Weekly', 'Monthly'] as const).map(r => (
                <button key={r} onClick={() => setChartRange(r)} style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: chartRange === r ? '#724B68' : 'transparent',
                  color: chartRange === r ? '#fff' : '#4B5563',
                  transition: 'all 0.15s', fontFamily: 'Poppins, Inter, sans-serif',
                }}>{r}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '16px 20px' }}>
            <LineChart data={chartData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#4B5563' }}>
                {chartRange === 'Monthly' ? 'Jan — ₹68k' : 'W1 — ₹28k'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#724B68' }}>
                {chartRange === 'Monthly' ? 'May — ₹1,46.5k ↑' : 'W4 — ₹43.5k ↑'}
              </span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Revenue vs Expenses', 'Weekly comparison — May 2024',
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4B5563' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#724B68', display: 'inline-block' }} /> Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4B5563' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#93c5fd', display: 'inline-block' }} /> Expenses
              </span>
            </div>
          )}
          <div style={{ padding: '16px 20px' }}>
            <BarChart data={WEEKLY_TREND} />
          </div>
        </div>
      </div>

      {/* ── 3. Top Customers + Top Products ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* Top Customers */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Top Customers', 'By total purchase value',
            <span style={{ fontSize: 11, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> {TOP_CUSTOMERS.length} customers
            </span>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['#', 'Customer', 'Orders', 'Total Purchase'].map(h => (
                  <th key={h} style={{ ...thStyle, textAlign: h === 'Total Purchase' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_CUSTOMERS.map((c, i) => (
                <tr key={c.name}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(114,75,104,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '11px 16px', fontWeight: 700, color: '#9ca3af', width: 32 }}>{i + 1}</td>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1F2933' }}>{c.name}</td>
                  <td style={{ padding: '11px 16px', color: '#4B5563' }}>{c.orders}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: '#724B68' }}>₹{c.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Top Selling Products', 'By revenue generated',
            <span style={{ fontSize: 11, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Package size={11} /> {TOP_PRODUCTS.length} products
            </span>
          )}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOP_PRODUCTS.map((p, i) => {
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
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>₹{p.revenue.toLocaleString()}</span>
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

      {/* ── 4. GST Insights + Inventory Insights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* GST Insights */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('GST Insights', 'CGST / SGST / IGST breakdown — May 2024')}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'CGST', value: GST_SUMMARY.cgst, color: '#724B68', bg: 'rgba(114,75,104,0.08)' },
                { label: 'SGST', value: GST_SUMMARY.sgst, color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
                { label: 'IGST', value: GST_SUMMARY.igst, color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
              ].map(g => (
                <div key={g.label} style={{ background: g.bg, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: g.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{g.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: g.color, fontFamily: 'Poppins, Inter, sans-serif' }}>
                    {g.value > 0 ? `₹${g.value.toLocaleString()}` : '—'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(114,75,104,0.06)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>Total GST Collected</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#724B68', fontFamily: 'Poppins, Inter, sans-serif' }}>₹{gstTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Inventory Insights */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {cardHead('Inventory Insights', 'Stock alerts and low inventory',
            <span style={{ fontSize: 11, background: 'rgba(202,138,4,0.1)', color: '#ca8a04', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11} /> {LOW_STOCK_ITEMS.length} alerts
            </span>
          )}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOW_STOCK_ITEMS.map(item => {
              const critical = item.stock <= 10
              const pct = (item.stock / item.threshold) * 100
              return (
                <div key={item.id}
                  style={{ background: critical ? 'rgba(220,38,38,0.03)' : 'rgba(202,138,4,0.03)', border: `1px solid ${critical ? 'rgba(220,38,38,0.12)' : 'rgba(202,138,4,0.12)'}`, borderRadius: 10, padding: '12px 14px', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{item.category}</span>
                    </div>
                    <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: critical ? 'rgba(220,38,38,0.1)' : 'rgba(202,138,4,0.1)', color: critical ? '#dc2626' : '#ca8a04' }}>
                      {critical ? 'Critical' : 'Low Stock'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: critical ? '#dc2626' : '#ca8a04', borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: critical ? '#dc2626' : '#ca8a04', whiteSpace: 'nowrap' }}>
                      {item.stock} / {item.threshold}
                    </span>
                  </div>
                </div>
              )
            })}
            <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Out of Stock</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>0 items</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .tables-grid { grid-template-columns: 1fr !important; } }
      `}</style>

    </ViewerLayout>
  )
}
