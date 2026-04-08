import { useState, useEffect } from 'react'
import { Search, Eye, Download } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'
import InvoiceDetailModal, { type Invoice } from '../../component/billing/InvoiceDetailModal'
import { downloadPDF } from '../../component/billing/InvoiceDetailModal'
import { billingApi } from '../../api/billingApi'
import type { InvoiceResponse } from '../../api/types'

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

function Badge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#16a34a' : '#ca8a04' }}>{status}</span>
}

export default function StaffInvoicesPage() {
  const [invoices, setInvoices]       = useState<Invoice[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    billingApi.getInvoices({ size: 500, sort: 'createdAt,desc' })
      .then(res => setInvoices(res.data.content.map(toInvoice)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(inv =>
    inv.id.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <StaffLayout>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Invoice History</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>View and print your past invoices.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>All Invoices</h3>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input placeholder="Search by ID or customer…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#724B68'}
              onBlur={e => e.target.style.borderColor = '#E7E9ED'}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Invoice ID', 'Customer Name', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No invoices found.</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#724B68' }}>{inv.id}</td>
                  <td style={{ padding: '13px 20px', fontWeight: 500, color: '#1F2933' }}>{inv.customer}</td>
                  <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{inv.date}</td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>₹{inv.amount.toLocaleString()}</td>
                  <td style={{ padding: '13px 20px' }}><Badge status={inv.status} /></td>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setViewInvoice(inv)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      ><Eye size={13} /> View</button>
                      <button onClick={() => downloadPDF(inv)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </StaffLayout>
  )
}
