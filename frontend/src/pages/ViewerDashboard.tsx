import { useState } from 'react'
import { TrendingUp, FileText, IndianRupee, Users, Eye, Download, FileSpreadsheet, BarChart2, Receipt } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import InvoiceDetailModal, { downloadPDF, type Invoice } from '../component/billing/InvoiceDetailModal'
import { SALES_DATA, GST_SUMMARY } from '../component/reports/reportsData'

// ── Static data ──────────────────────────────────────────────
const STATS = [
  { label: 'Total Sales',     value: '₹1,46,500', sub: 'May 2024',        icon: TrendingUp,  color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
  { label: 'Total Orders',    value: '320',        sub: '12 pending',      icon: FileText,    color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.15)'  },
  { label: 'GST Collected',   value: '₹26,370',   sub: 'CGST + SGST',     icon: IndianRupee, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)'  },
  { label: 'Total Customers', value: '85',         sub: '6 active this month', icon: Users,  color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)'  },
]

const MONTHLY = [
  { month: 'Jan', sales: 68000  },
  { month: 'Feb', sales: 94000  },
  { month: 'Mar', sales: 81000  },
  { month: 'Apr', sales: 120000 },
  { month: 'May', sales: 146500 },
]

const CATEGORY_PIE = [
  { label: 'Cement', pct: 40, color: '#724B68' },
  { label: 'Steel',  pct: 30, color: '#2563eb' },
  { label: 'Pipes',  pct: 20, color: '#059669' },
  { label: 'Others', pct: 10, color: '#ca8a04' },
]

const INVOICES: Invoice[] = [
  { id: 'INV-1026', customer: 'Patel Enterprises',  phone: '+91 98006 66666', address: '22, SG Highway, Ahmedabad', date: '21 May 2024', amount: 6400,  gst: 1152, status: 'Paid',    items: [{ name: 'Steel Rods',    qty: 1,  price: 6200, gstRate: 18 }] },
  { id: 'INV-1025', customer: 'Kumar & Sons',        phone: '+91 98005 55555', address: '88, GT Road, Kolkata',     date: '22 May 2024', amount: 12000, gst: 2160, status: 'Paid',    items: [{ name: 'Cement Bags',   qty: 20, price: 380,  gstRate: 28 }] },
  { id: 'INV-1024', customer: 'Sharma Builders',     phone: '+91 98004 44444', address: '3, Civil Lines, Delhi',    date: '23 May 2024', amount: 4200,  gst: 756,  status: 'Pending', items: [{ name: 'Plywood Sheets', qty: 3, price: 1200, gstRate: 18 }] },
  { id: 'INV-1023', customer: 'Ravi Constructions',  phone: '+91 98003 33333', address: '7, NH-48, Chennai',        date: '23 May 2024', amount: 8500,  gst: 1530, status: 'Paid',    items: [{ name: 'Steel Rods',    qty: 1,  price: 6200, gstRate: 18 }] },
  { id: 'INV-1022', customer: 'Amit Hardware',       phone: '+91 98002 22222', address: '45, Ring Road, Pune',      date: '24 May 2024', amount: 1800,  gst: 324,  status: 'Pending', items: [{ name: 'PVC Pipes',      qty: 6,  price: 240,  gstRate: 18 }] },
  { id: 'INV-1021', customer: 'Rahul Traders',       phone: '+91 98001 11111', address: '12, MG Road, Bengaluru',   date: '24 May 2024', amount: 3200,  gst: 576,  status: 'Paid',    items: [{ name: 'Cement Bags',   qty: 5,  price: 380,  gstRate: 28 }] },
]

const maxSales = Math.max(...MONTHLY.map(m => m.sales))

// ── Pie chart (CSS conic-gradient) ───────────────────────────
function PieChart() {
  const [hovered, setHovered] = useState<string | null>(null)
  let cumulative = 0
  const segments = CATEGORY_PIE.map(c => {
    const start = cumulative
    cumulative += c.pct
    return { ...c, start, end: cumulative }
  })
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <div style={{ width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(${gradient})`, transition: 'transform 0.3s' }} />
        {/* donut hole */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 70, height: 70, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1F2933' }}>Sales</span>
          <span style={{ fontSize: 10, color: '#4B5563' }}>Mix</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CATEGORY_PIE.map(c => (
          <div key={c.label}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'default', opacity: hovered && hovered !== c.label ? 0.5 : 1, transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHovered(c.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#4B5563', width: 56 }}>{c.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SVG line chart ────────────────────────────────────────────
function LineChart() {
  const W = 420, H = 120, PAD = 16
  const pts = MONTHLY.map((m, i) => ({
    x: PAD + (i / (MONTHLY.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - m.sales / maxSales) * (H - PAD * 2),
    ...m,
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#724B68" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#724B68" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#vg)" />
      <path d={path} fill="none" stroke="#724B68" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(p => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r={4} fill="#724B68" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">{p.month}</text>
        </g>
      ))}
    </svg>
  )
}

function downloadCSV() {
  const header = 'Date,Invoice ID,Customer,Amount,GST,Status\n'
  const body = SALES_DATA.map(r => `${r.date},${r.invoiceId},${r.customer},${r.amount},${r.gst},${r.status}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'viewer-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Page ─────────────────────────────────────────────────────
export default function ViewerDashboard() {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  return (
    <ViewerLayout>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
          Welcome back 👋 Here's your read-only overview for May 2024.
        </p>
      </div>

      {/* Read-only notice */}
      <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Eye size={16} color="#059669" />
        <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>Viewer Mode — You have read-only access. Editing, creating, and deleting are disabled.</span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 16 }}>
        {STATS.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: color, borderRadius: 9, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="#fff" />
              </div>
              <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#4B5563' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* Sales line chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Sales Overview</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Monthly revenue — Jan to May 2024</p>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <LineChart />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#4B5563' }}>Jan — ₹68k</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#724B68' }}>May — ₹1,46.5k ↑</span>
            </div>
          </div>
        </div>

        {/* Category pie chart */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Category Sales</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Sales distribution by product category</p>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <PieChart />
          </div>
        </div>
      </div>

      {/* Recent Invoices — view/download only */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Recent Invoices</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>View and download only</p>
          </div>
          <span style={{ fontSize: 11, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={11} /> Read Only
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Invoice ID', 'Customer', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={inv.id}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(5,150,105,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#724B68' }}>{inv.id}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#1F2933' }}>{inv.customer}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#1F2933' }}>₹{inv.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: inv.status === 'Paid' ? '#dcfce7' : '#fef9c3', color: inv.status === 'Paid' ? '#16a34a' : '#ca8a04' }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#4B5563', whiteSpace: 'nowrap' }}>{inv.date}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setViewInvoice(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => downloadPDF(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Quick Access */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E9ED' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Reports</h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Quick access to downloadable reports</p>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14 }}>
          {[
            { label: 'Sales Report',     sub: 'Monthly revenue data',    icon: TrendingUp, color: '#724B68', bg: 'rgba(114,75,104,0.07)' },
            { label: 'GST Report',       sub: `CGST ₹${GST_SUMMARY.cgst.toLocaleString()} · SGST ₹${GST_SUMMARY.sgst.toLocaleString()}`, icon: Receipt,    color: '#2563eb', bg: 'rgba(37,99,235,0.07)'  },
            { label: 'Inventory Report', sub: '3 items low on stock',    icon: BarChart2,  color: '#059669', bg: 'rgba(5,150,105,0.07)'  },
          ].map(({ label, sub, icon: Icon, color, bg }) => (
            <div key={label}
              style={{ background: bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${color}22`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ background: color, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{label}</span>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: '#4B5563' }}>{sub}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => downloadPDF(INVOICES[0])}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: 'none', background: color, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Download size={12} /> PDF
                </button>
                <button onClick={downloadCSV}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${color}44`, background: '#fff', color, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <FileSpreadsheet size={12} /> Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </ViewerLayout>
  )
}
