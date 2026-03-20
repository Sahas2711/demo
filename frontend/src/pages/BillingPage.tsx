import { useState } from 'react'
import { Download, BarChart2 } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import InvoiceSummaryCards from '../component/billing/InvoiceSummaryCards'
import InvoiceTable, { INITIAL } from '../component/billing/InvoiceTable'
import InvoiceDetailModal, { type Invoice } from '../component/billing/InvoiceDetailModal'

const GST_DATA = [
  { label: 'CGST Collected',  value: '₹22,122', sub: '50% of total GST', color: '#724B68', bg: 'rgba(114,75,104,0.08)', bar: 50 },
  { label: 'SGST Collected',  value: '₹22,122', sub: '50% of total GST', color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  bar: 50 },
  { label: 'IGST Collected',  value: '₹0',      sub: 'Inter-state sales', color: '#059669', bg: 'rgba(5,150,105,0.08)', bar: 0  },
  { label: 'Total GST',       value: '₹44,244', sub: 'May 2024',          color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', bar: 100 },
]

const MONTHLY_GST = [
  { month: 'Jan', cgst: 8200,  sgst: 8200  },
  { month: 'Feb', cgst: 11400, sgst: 11400 },
  { month: 'Mar', cgst: 9800,  sgst: 9800  },
  { month: 'Apr', cgst: 14600, sgst: 14600 },
  { month: 'May', cgst: 22122, sgst: 22122 },
]
const maxGst = Math.max(...MONTHLY_GST.map(m => m.cgst + m.sgst))

export default function BillingPage() {
  const [invoices, setInvoices]       = useState<Invoice[]>(INITIAL)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  return (
    <DashboardLayout>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Billing Overview
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Monitor invoices, GST collections, and sales performance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 10,
            border: '1.5px solid #E7E9ED', background: '#fff',
            fontSize: 14, fontWeight: 600, color: '#1F2933', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#724B68'; e.currentTarget.style.color = '#724B68' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.color = '#1F2933' }}
          >
            <BarChart2 size={16} /> View Sales Report
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
            boxShadow: '0 4px 14px rgba(114,75,104,0.3)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <InvoiceSummaryCards />

      {/* Invoice table */}
      <InvoiceTable invoices={invoices} onView={inv => setViewInvoice(inv)} />

      {/* GST Summary Section */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
              GST Summary
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Breakdown of GST collected — May 2024</p>
          </div>
          <span style={{ fontSize: 12, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>
            FY 2024–25
          </span>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="tables-grid">

          {/* GST cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {GST_DATA.map(({ label, value, sub, color, bg, bar }) => (
              <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${color}22` }}>
                <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 500, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 6 }}>{value}</div>
                <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${bar}%`, background: color, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#4B5563' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly GST bar chart */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginBottom: 16 }}>Monthly GST Trend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MONTHLY_GST.map(m => {
                const total = m.cgst + m.sgst
                const pct = (total / maxGst) * 100
                return (
                  <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#4B5563', width: 28, flexShrink: 0 }}>{m.month}</span>
                    <div style={{ flex: 1, height: 28, background: '#F5F6F8', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct / 2}%`, background: '#724B68', borderRadius: '6px 0 0 6px', transition: 'width 0.5s' }} />
                      <div style={{ position: 'absolute', left: `${pct / 2}%`, top: 0, height: '100%', width: `${pct / 2}%`, background: '#2563eb', transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2933', width: 64, textAlign: 'right', flexShrink: 0 }}>
                      ₹{(total / 1000).toFixed(1)}k
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
              {[['#724B68', 'CGST'], ['#2563eb', 'SGST']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice detail modal */}
      {viewInvoice && (
        <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </DashboardLayout>
  )
}
