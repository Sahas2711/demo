import { useState, useMemo } from 'react'
import { Download, FileSpreadsheet, TrendingUp, IndianRupee, FileText, AlertTriangle, Eye, Search } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import { SALES_DATA, GST_SUMMARY, LOW_STOCK_ITEMS, type SalesRow } from '../component/reports/reportsData'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CUSTOMERS = ['All Customers', ...Array.from(new Set(SALES_DATA.map(r => r.customer)))]
const DATE_RANGES = ['All Time', 'Daily', 'Weekly', 'Monthly']

function downloadCSV(rows: SalesRow[]) {
  const header = 'Date,Invoice ID,Customer,Amount,GST,Status\n'
  const body = rows.map(r => `${r.date},${r.invoiceId},${r.customer},${r.amount},${r.gst},${r.status}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'viewer-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

function downloadPDF(rows: SalesRow[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(114, 75, 104)
  doc.rect(0, 0, W, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('INVENTRA', 14, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Sales & GST Report — May 2024', 14, 22)
  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Invoice ID', 'Customer', 'Amount (₹)', 'GST (₹)', 'Status']],
    body: rows.map(r => [r.date, r.invoiceId, r.customer, r.amount.toLocaleString(), r.gst.toLocaleString(), r.status]),
    headStyles: { fillColor: [114, 75, 104], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 246, 248] },
    margin: { left: 14, right: 14 },
  })
  doc.save('viewer-report.pdf')
}

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #E7E9ED',
  borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}

const thStyle: React.CSSProperties = {
  padding: '11px 16px', textAlign: 'left', fontSize: 11,
  fontWeight: 700, color: '#4B5563', textTransform: 'uppercase',
  letterSpacing: '0.4px', whiteSpace: 'nowrap', background: '#F5F6F8',
}

export default function ViewerReportsPage() {
  const [range, setRange]       = useState('All Time')
  const [customer, setCustomer] = useState('All Customers')
  const [search, setSearch]     = useState('')

  const filtered = useMemo(() => {
    let rows = SALES_DATA
    if (customer !== 'All Customers') rows = rows.filter(r => r.customer === customer)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.invoiceId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q))
    }
    return rows
  }, [customer, search])

  const totalSales    = filtered.reduce((s, r) => s + r.amount, 0)
  const totalGST      = filtered.reduce((s, r) => s + r.gst, 0)
  const gstTotal      = GST_SUMMARY.cgst + GST_SUMMARY.sgst + GST_SUMMARY.igst

  const selectStyle: React.CSSProperties = {
    padding: '8px 14px', borderRadius: 9, border: '1.5px solid #E7E9ED',
    fontSize: 13, color: '#1F2933', background: '#fff', outline: 'none',
    fontFamily: 'Poppins, Inter, sans-serif', cursor: 'pointer', transition: 'border-color 0.2s',
  }

  return (
    <ViewerLayout>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Reports
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Sales performance, GST summaries and inventory insights — read-only.
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      {/* ── Filters ── */}
      <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>Filters:</span>

        <select value={range} onChange={e => setRange(e.target.value)} style={selectStyle}
          onFocus={e => e.currentTarget.style.borderColor = '#724B68'}
          onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
        >
          {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
        </select>

        <select value={customer} onChange={e => setCustomer(e.target.value)} style={selectStyle}
          onFocus={e => e.currentTarget.style.borderColor = '#724B68'}
          onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
        >
          {CUSTOMERS.map(c => <option key={c}>{c}</option>)}
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 300 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice or customer…"
            style={{ ...selectStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#724B68'}
            onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => downloadCSV(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 13, fontWeight: 600, color: '#1F2933', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.color = '#1F2933' }}
          >
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button
            onClick={() => downloadPDF(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9, border: 'none', background: '#724B68', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(114,75,104,0.25)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Download size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: 16 }}>
        {[
          { label: 'Total Sales',     value: `₹${totalSales.toLocaleString()}`,  icon: TrendingUp,    color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
          { label: 'GST Collected',   value: `₹${totalGST.toLocaleString()}`,    icon: IndianRupee,   color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.15)'  },
          { label: 'Total Invoices',  value: `${filtered.length}`,               icon: FileText,      color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)'  },
          { label: 'Low Stock Items', value: `${LOW_STOCK_ITEMS.length}`,        icon: AlertTriangle, color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)'  },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
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
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Sales Report Table ── */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Sales Report</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>{filtered.length} transactions · {range}</p>
          </div>
          <span style={{ fontSize: 12, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>May 2024</span>
        </div>

        {/* Desktop table */}
        <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }} className="vr-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr>
                {['Date', 'Invoice ID', 'Customer Name', 'Amount', 'GST', 'Status'].map(h => (
                  <th key={h} style={{ ...thStyle, textAlign: h === 'Amount' || h === 'GST' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No records match your filters.</td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.invoiceId}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(114,75,104,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '12px 16px', color: '#4B5563', whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#724B68', whiteSpace: 'nowrap' }}>{row.invoiceId}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2933' }}>{row.customer}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1F2933' }}>₹{row.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4B5563' }}>₹{row.gst.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: row.status === 'Paid' ? 'rgba(5,150,105,0.1)' : 'rgba(202,138,4,0.1)', color: row.status === 'Paid' ? '#059669' : '#ca8a04' }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="vr-cards-wrap" style={{ display: 'none', flexDirection: 'column', gap: 0 }}>
          {filtered.map((row, i) => (
            <div key={row.invoiceId} style={{ padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid #F5F6F8', transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(114,75,104,0.03)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#724B68' }}>{row.invoiceId}</span>
                <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: row.status === 'Paid' ? 'rgba(5,150,105,0.1)' : 'rgba(202,138,4,0.1)', color: row.status === 'Paid' ? '#059669' : '#ca8a04' }}>{row.status}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2933', marginBottom: 2 }}>{row.customer}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{row.date}</div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div><div style={{ fontSize: 11, color: '#9ca3af' }}>Amount</div><div style={{ fontWeight: 700, fontSize: 14, color: '#1F2933' }}>₹{row.amount.toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11, color: '#9ca3af' }}>GST</div><div style={{ fontWeight: 600, fontSize: 13, color: '#4B5563' }}>₹{row.gst.toLocaleString()}</div></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 18px', borderTop: '1px solid #F5F6F8', fontSize: 12, color: '#9ca3af' }}>
          Showing {filtered.length} of {SALES_DATA.length} records
        </div>
      </div>

      {/* ── GST Summary + Inventory ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* GST Summary */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E9ED' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>GST Summary</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Breakdown for May 2024</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Component', 'Rate', 'Amount'].map(h => (
                  <th key={h} style={{ ...thStyle, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'CGST', rate: '9%',  value: GST_SUMMARY.cgst,  color: '#724B68' },
                { label: 'SGST', rate: '9%',  value: GST_SUMMARY.sgst,  color: '#2563eb' },
                { label: 'IGST', rate: '18%', value: GST_SUMMARY.igst,  color: '#059669' },
              ].map((row, i) => (
                <tr key={row.label}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(114,75,104,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: row.color }}>{row.label}</td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>{row.rate}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1F2933' }}>₹{row.value.toLocaleString()}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #E7E9ED', background: 'rgba(114,75,104,0.04)' }}>
                <td style={{ padding: '13px 16px', fontWeight: 800, color: '#1F2933', fontSize: 14 }} colSpan={2}>Total GST</td>
                <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 800, color: '#724B68', fontSize: 16, fontFamily: 'Poppins, Inter, sans-serif' }}>₹{gstTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Inventory Report */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Inventory Report</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#4B5563' }}>Items below minimum threshold</p>
            </div>
            <span style={{ fontSize: 11, background: 'rgba(202,138,4,0.1)', color: '#ca8a04', padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={11} /> {LOW_STOCK_ITEMS.length} Low Stock
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Product', 'Category', 'Stock', 'Status'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOW_STOCK_ITEMS.map((item, i) => {
                const critical = item.stock <= 10
                return (
                  <tr key={item.id}
                    style={{ borderTop: '1px solid #F5F6F8', background: critical ? 'rgba(220,38,38,0.02)' : i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = critical ? 'rgba(220,38,38,0.05)' : 'rgba(202,138,4,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = critical ? 'rgba(220,38,38,0.02)' : i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2933' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', color: '#4B5563' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: critical ? '#dc2626' : '#ca8a04' }}>{item.stock}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 3 }}>/ {item.threshold}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: critical ? 'rgba(220,38,38,0.1)' : 'rgba(202,138,4,0.1)', color: critical ? '#dc2626' : '#ca8a04' }}>
                        {critical ? 'Critical' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .vr-table-wrap { display: none !important; }
          .vr-cards-wrap { display: flex !important; }
        }
      `}</style>

    </ViewerLayout>
  )
}
