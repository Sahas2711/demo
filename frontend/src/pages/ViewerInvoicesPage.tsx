import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, Download, FileText } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import InvoiceDetailModal, { downloadPDF, type Invoice } from '../component/billing/InvoiceDetailModal'
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
    status: inv.status === 'PAID' ? 'Paid' : 'Pending',
    items: inv.items.map(it => ({ name: it.productName, qty: it.quantity, price: it.unitPrice, gstRate: it.gstPercentage })),
  }
}

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#16a34a' : '#ca8a04' }}>
      {status}
    </span>
  )
}

export default function ViewerInvoicesPage() {
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    billingApi.getInvoices({ size: 500, sort: 'createdAt,desc' })
      .then(res => setInvoices(res.data.content.map(toInvoice)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(inv =>
      inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q)
    )
  }, [search, invoices])

  return (
    <ViewerLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Invoices</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>View and download invoices — read-only access.</p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED', padding: '14px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by invoice ID or customer name…"
            style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: 9, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = '#059669'}
            onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
          />
        </div>
        <span style={{ fontSize: 13, color: '#4B5563', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {filtered.length} of {invoices.length} invoices
        </span>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Invoice ID', 'Customer Name', 'Date', 'Amount', 'GST', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: h === 'Amount' || h === 'GST' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                    <FileText size={32} color="#E7E9ED" style={{ display: 'block', margin: '0 auto 10px' }} />
                    No invoices found.
                  </td>
                </tr>
              ) : filtered.map((inv, i) => (
                <tr key={inv.id}
                  style={{ borderTop: '1px solid #F5F6F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(5,150,105,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '13px 18px', fontWeight: 700, color: '#724B68', whiteSpace: 'nowrap' }}>{inv.id}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 600, color: '#1F2933' }}>{inv.customer}</td>
                  <td style={{ padding: '13px 18px', color: '#4B5563', whiteSpace: 'nowrap' }}>{inv.date}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'right', fontWeight: 700, color: '#1F2933' }}>₹{inv.amount.toLocaleString()}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'right', color: '#4B5563' }}>₹{inv.gst.toLocaleString()}</td>
                  <td style={{ padding: '13px 18px' }}><StatusBadge status={inv.status} /></td>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setViewInvoice(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      ><Eye size={13} /> View</button>
                      <button onClick={() => downloadPDF(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8'; e.currentTarget.style.borderColor = '#4B5563' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                        title="Download PDF"
                      ><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #F5F6F8', fontSize: 12, color: '#9ca3af' }}>
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </ViewerLayout>
  )
}
