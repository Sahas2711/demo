import { useState, useEffect } from 'react'
import { TrendingUp, FileText, IndianRupee, Users, Eye, Download, FileSpreadsheet, BarChart2, Receipt } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import InvoiceDetailModal, { downloadPDF, type Invoice } from '../component/billing/InvoiceDetailModal'
import { billingApi } from '../api/billingApi'
import { customerApi } from '../api/customerApi'
import type { InvoiceResponse } from '../api/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function toInvoice(inv: InvoiceResponse): Invoice {
  return {
    id: inv.invoiceNumber,
    customer: inv.customerName,
    phone: '',
    address: '',
    date: new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    amount: inv.totalAmount,
    gst: inv.cgst + inv.sgst + inv.igst,
    status: inv.status === 'PAID' ? 'Paid' : 'Pending',
    items: inv.items.map(it => ({ name: it.productName, qty: it.quantity, price: it.unitPrice, gstRate: it.gstPercentage })),
  }
}

function LineChart({ data }: { data: { label: string; sales: number }[] }) {
  const W = 420, H = 120, PAD = 16
  const max = Math.max(...data.map(d => d.sales), 1)
  const pts = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
    y: PAD + (1 - d.sales / max) * (H - PAD * 2),
    ...d,
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
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={4} fill="#724B68" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize={10} fill="#9ca3af">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

function downloadCSV(invoices: Invoice[]) {
  const header = 'Date,Invoice ID,Customer,Amount,GST,Status\n'
  const body = invoices.map(r => `${r.date},${r.id},${r.customer},${r.amount},${r.gst},${r.status}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'viewer-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ViewerDashboard() {
  const [invoices, setInvoices]         = useState<Invoice[]>([])
  const [monthlyData, setMonthlyData]   = useState<{ label: string; sales: number }[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [totalGst, setTotalGst]         = useState({ cgst: 0, sgst: 0 })
  const [loading, setLoading]           = useState(true)
  const [viewInvoice, setViewInvoice]   = useState<Invoice | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [invRes, custRes] = await Promise.all([
          billingApi.getInvoices({ size: 500, sort: 'createdAt,desc' }),
          customerApi.getCustomers({ size: 1 }),
        ])
        const raw = invRes.data.content
        const mapped = raw.map(toInvoice)
        setInvoices(mapped)
        setCustomerCount(custRes.data.totalElements)

        // Build monthly trend
        const map: Record<string, number> = {}
        for (const inv of raw) {
          const m = MONTHS[new Date(inv.createdAt).getMonth()]
          map[m] = (map[m] ?? 0) + inv.grandTotal
        }
        setMonthlyData(MONTHS.filter(m => map[m]).map(m => ({ label: m, sales: map[m] })))

        const cgst = raw.reduce((s, i) => s + i.cgst, 0)
        const sgst = raw.reduce((s, i) => s + i.sgst, 0)
        setTotalGst({ cgst, sgst })
      } catch { /* handled by interceptor */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const totalSales   = invoices.reduce((s, i) => s + i.amount, 0)
  const totalOrders  = invoices.length
  const pendingCount = invoices.filter(i => i.status === 'Pending').length
  const gstTotal     = totalGst.cgst + totalGst.sgst

  const STATS = [
    { label: 'Total Sales',     value: loading ? '…' : `₹${totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'All time',           icon: TrendingUp,  color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
    { label: 'Total Orders',    value: loading ? '…' : `${totalOrders}`,  sub: `${pendingCount} pending`,  icon: FileText,    color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.15)'  },
    { label: 'GST Collected',   value: loading ? '…' : `₹${gstTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'CGST + SGST', icon: IndianRupee, color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)'  },
    { label: 'Total Customers', value: loading ? '…' : `${customerCount}`, sub: 'Registered',            icon: Users,       color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)'  },
  ]

  const recentInvoices = invoices.slice(0, 6)

  return (
    <ViewerLayout>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Welcome back 👋 Here's your read-only overview.</p>
      </div>

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

      {/* Sales Chart */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Sales Overview</h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Monthly revenue</p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {loading ? <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading…</div>
            : <LineChart data={monthlyData.length ? monthlyData : [{ label: 'No data', sales: 0 }]} />}
        </div>
      </div>

      {/* Recent Invoices */}
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
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : recentInvoices.map((inv, i) => (
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
                      ><Eye size={13} /> View</button>
                      <button onClick={() => downloadPDF(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      ><Download size={13} /></button>
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
            { label: 'Sales Report',     sub: 'All invoice data',    icon: TrendingUp, color: '#724B68', bg: 'rgba(114,75,104,0.07)' },
            { label: 'GST Report',       sub: `CGST ₹${totalGst.cgst.toLocaleString()} · SGST ₹${totalGst.sgst.toLocaleString()}`, icon: Receipt, color: '#2563eb', bg: 'rgba(37,99,235,0.07)' },
            { label: 'Inventory Report', sub: 'Stock overview',      icon: BarChart2,  color: '#059669', bg: 'rgba(5,150,105,0.07)' },
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
                <button onClick={() => recentInvoices[0] && downloadPDF(recentInvoices[0])}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: 'none', background: color, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                ><Download size={12} /> PDF</button>
                <button onClick={() => downloadCSV(invoices)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${color}44`, background: '#fff', color, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                ><FileSpreadsheet size={12} /> Excel</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </ViewerLayout>
  )
}
