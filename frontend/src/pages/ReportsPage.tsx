import { useState, useMemo } from 'react'
import { Download, FileSpreadsheet, TrendingUp, IndianRupee, AlertTriangle, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import { SALES_DATA, GST_SUMMARY, LOW_STOCK_ITEMS, MONTHLY_TREND, type SalesRow } from '../component/reports/reportsData'

type Range = 'Daily' | 'Weekly' | 'Monthly'

const RANGE_FILTERS: Range[] = ['Daily', 'Weekly', 'Monthly']

const maxSales = Math.max(...MONTHLY_TREND.map(m => m.sales))

function card(bg: string, border: string) {
  return {
    background: bg, border: `1px solid ${border}`,
    borderRadius: 16, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  } as React.CSSProperties
}

function downloadPDFReport(rows: SalesRow[]) {
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

  const afterY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 41, 51)
  doc.text('GST Summary', 14, afterY)
  const gstRows: [string, string][] = [
    ['CGST', `₹${GST_SUMMARY.cgst.toLocaleString()}`],
    ['SGST', `₹${GST_SUMMARY.sgst.toLocaleString()}`],
    ['IGST', `₹${GST_SUMMARY.igst.toLocaleString()}`],
    ['Total GST', `₹${(GST_SUMMARY.cgst + GST_SUMMARY.sgst + GST_SUMMARY.igst).toLocaleString()}`],
  ]
  gstRows.forEach(([k, v], i) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text(k, 14, afterY + 8 + i * 7)
    doc.setTextColor(31, 41, 51)
    doc.setFont('helvetica', 'bold')
    doc.text(v, 80, afterY + 8 + i * 7)
  })

  doc.save('inventra-report.pdf')
}

function downloadExcel(rows: SalesRow[]) {
  const header = 'Date,Invoice ID,Customer,Amount,GST,Status\n'
  const body = rows.map(r => `${r.date},${r.invoiceId},${r.customer},${r.amount},${r.gst},${r.status}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'inventra-report.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [range, setRange] = useState<Range>('Monthly')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let rows = SALES_DATA
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.customer.toLowerCase().includes(q) ||
        r.invoiceId.toLowerCase().includes(q)
      )
    }
    return rows
  }, [search])

  const totalSales = filtered.reduce((s, r) => s + r.amount, 0)
  const totalGST   = filtered.reduce((s, r) => s + r.gst, 0)

  const gstTotal = GST_SUMMARY.cgst + GST_SUMMARY.sgst + GST_SUMMARY.igst

  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Reports
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Sales performance, GST summaries, and inventory insights.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => downloadExcel(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#1F2933', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.color = '#1F2933' }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button
            onClick={() => downloadPDFReport(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(114,75,104,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Date Range:</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGE_FILTERS.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '7px 18px', borderRadius: 8, border: '1.5px solid',
              borderColor: range === r ? '#724B68' : '#E7E9ED',
              background: range === r ? 'rgba(114,75,104,0.08)' : '#fff',
              color: range === r ? '#724B68' : '#4B5563',
              fontSize: 13, fontWeight: range === r ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice or customer…"
            style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', outline: 'none', width: 220, fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#724B68' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E7E9ED' }}
          />
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Sales',    value: `₹${totalSales.toLocaleString()}`,   icon: TrendingUp,    color: '#724B68', bg: 'rgba(114,75,104,0.08)', border: 'rgba(114,75,104,0.15)' },
          { label: 'GST Collected',  value: `₹${totalGST.toLocaleString()}`,     icon: IndianRupee,   color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.15)'  },
          { label: 'Invoices',       value: `${filtered.length}`,                icon: FileText,      color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.15)'  },
          { label: 'Low Stock Items',value: `${LOW_STOCK_ITEMS.length}`,         icon: AlertTriangle, color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', border: 'rgba(202,138,4,0.15)'  },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label}
            style={card(bg, border)}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
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
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Sales Report</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>{filtered.length} transactions — {range} view</p>
          </div>
          <span style={{ fontSize: 12, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>May 2024</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Date', 'Invoice ID', 'Customer', 'Amount', 'GST', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Amount' || h === 'GST' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
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
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: row.status === 'Paid' ? 'rgba(5,150,105,0.1)' : 'rgba(202,138,4,0.1)',
                      color: row.status === 'Paid' ? '#059669' : '#ca8a04',
                    }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── GST Report + Monthly Trend ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tables-grid">

        {/* GST Breakdown */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>GST Report</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Breakdown for May 2024</p>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'CGST Collected', value: GST_SUMMARY.cgst, color: '#724B68', pct: 50 },
              { label: 'SGST Collected', value: GST_SUMMARY.sgst, color: '#2563eb', pct: 50 },
              { label: 'IGST Collected', value: GST_SUMMARY.igst, color: '#059669', pct: 0  },
            ].map(({ label, value, color, pct }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}> ₹{value.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #E7E9ED', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>Total GST</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#724B68', fontFamily: 'Poppins, Inter, sans-serif' }}>₹{gstTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Monthly Sales Trend */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Monthly Sales Trend</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Revenue overview — Jan to May 2024</p>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MONTHLY_TREND.map(m => {
              const pct = (m.sales / maxSales) * 100
              return (
                <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#4B5563', width: 28, flexShrink: 0, fontWeight: 600 }}>{m.month}</span>
                  <div style={{ flex: 1, height: 30, background: '#F5F6F8', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#724B68,#9B6F92)', borderRadius: 7, transition: 'width 0.6s ease' }} />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: pct > 60 ? '#fff' : '#1F2933', zIndex: 1 }}>
                      ₹{(m.sales / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Inventory Report (Low Stock) ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Inventory Report</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Items below minimum stock threshold</p>
          </div>
          <span style={{ fontSize: 12, background: 'rgba(202,138,4,0.1)', color: '#ca8a04', padding: '5px 12px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertTriangle size={12} /> {LOW_STOCK_ITEMS.length} Low Stock
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Product ID', 'Name', 'Category', 'Current Stock', 'Min. Threshold', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOW_STOCK_ITEMS.map((item, i) => (
                <tr key={item.id}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(202,138,4,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#724B68' }}>{item.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2933' }}>{item.name}</td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>{item.category}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: item.stock <= 10 ? '#dc2626' : '#ca8a04' }}>{item.stock}</span>
                    <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 4 }}>units</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4B5563' }}>{item.threshold} units</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: item.stock <= 10 ? 'rgba(220,38,38,0.1)' : 'rgba(202,138,4,0.1)',
                      color: item.stock <= 10 ? '#dc2626' : '#ca8a04',
                    }}>
                      {item.stock <= 10 ? 'Critical' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </DashboardLayout>
  )
}
