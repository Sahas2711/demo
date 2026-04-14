import { useState, useEffect } from 'react'
import { Download, BarChart2 } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import InvoiceSummaryCards from '../component/billing/InvoiceSummaryCards'
import InvoiceTable from '../component/billing/InvoiceTable'
import InvoiceDetailModal, { type Invoice } from '../component/billing/InvoiceDetailModal'
import { billingApi } from '../api/billingApi'
import type { InvoiceResponse } from '../api/types'

function toInvoice(inv: InvoiceResponse): Invoice {
  return {
    id: inv.invoiceNumber,
    customer: inv.customerName,
    phone: '',
    address: '',
    date: new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    amount: inv.totalAmount,
    gst: inv.cgst + inv.sgst + inv.igst,
    status: inv.status === 'PAID' ? 'Paid' : inv.status === 'SENT' ? 'Pending' : inv.status,
    items: inv.items.map(it => ({ name: it.productName, qty: it.quantity, price: it.unitPrice, gstRate: it.gstPercentage })),
  }
}

export default function BillingPage() {
  const [invoices, setInvoices]       = useState<InvoiceResponse[]>([])
  const [loading, setLoading]         = useState(true)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const res = await billingApi.getInvoices({ size: 200 })
        setInvoices(res.data.content)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const totalSales    = invoices.reduce((s, i) => s + i.grandTotal, 0)
  const totalCgst     = invoices.reduce((s, i) => s + i.cgst, 0)
  const totalSgst     = invoices.reduce((s, i) => s + i.sgst, 0)
  const totalIgst     = invoices.reduce((s, i) => s + i.igst, 0)
  const totalGst      = totalCgst + totalSgst + totalIgst
  const pendingCount  = invoices.filter(i => i.status === 'SENT').length

  return (
    <DashboardLayout>
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
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#1F2933', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#724B68'; e.currentTarget.style.color = '#724B68' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.color = '#1F2933' }}
          ><BarChart2 size={16} /> View Sales Report</button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(114,75,104,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          ><Download size={16} /> Export Report</button>
        </div>
      </div>

      <InvoiceSummaryCards totalSales={totalSales} totalInvoices={invoices.length} totalGst={totalGst} pendingCount={pendingCount} loading={loading} />
      <InvoiceTable invoices={invoices} loading={loading} onView={inv => setViewInvoice(toInvoice(inv))} />

      {/* GST Summary */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>GST Summary</h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Breakdown of GST collected</p>
          </div>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16 }}>
          {[
            { label: 'CGST Collected',  value: totalCgst,  color: '#724B68', bg: 'rgba(114,75,104,0.08)' },
            { label: 'SGST Collected',  value: totalSgst,  color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
            { label: 'IGST Collected',  value: totalIgst,  color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
            { label: 'Total GST',       value: totalGst,   color: '#ca8a04', bg: 'rgba(202,138,4,0.08)'  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${color}22` }}>
              <div style={{ fontSize: 12, color: '#4B5563', fontWeight: 500, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif' }}>
                ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </DashboardLayout>
  )
}
