import { useState } from 'react'
import { Search, Eye, Download } from 'lucide-react'
import type { Invoice } from './InvoiceDetailModal'
import { downloadPDF } from './InvoiceDetailModal'
import type { InvoiceResponse } from '../../api/types'

const INITIAL: Invoice[] = [
  { id: 'INV-1021', customer: 'Rahul Traders',      phone: '+91 98001 11111', address: '12, MG Road, Bengaluru', date: '24 May 2024', amount: 3200,  gst: 576,  status: 'Paid',    items: [{ name: 'Cement Bags',    qty: 5,  price: 380,  gstRate: 28 }, { name: 'Red Bricks', qty: 200, price: 8, gstRate: 5 }] },
  { id: 'INV-1022', customer: 'Amit Hardware',       phone: '+91 98002 22222', address: '45, Ring Road, Pune',   date: '24 May 2024', amount: 1800,  gst: 324,  status: 'Pending', items: [{ name: 'PVC Pipes',       qty: 6,  price: 240,  gstRate: 18 }] },
  { id: 'INV-1023', customer: 'Ravi Constructions',  phone: '+91 98003 33333', address: '7, NH-48, Chennai',     date: '23 May 2024', amount: 8500,  gst: 1530, status: 'Paid',    items: [{ name: 'Steel Rods',      qty: 1,  price: 6200, gstRate: 18 }, { name: 'PVC Pipes', qty: 5, price: 240, gstRate: 18 }] },
  { id: 'INV-1024', customer: 'Sharma Builders',     phone: '+91 98004 44444', address: '3, Civil Lines, Delhi', date: '23 May 2024', amount: 4200,  gst: 756,  status: 'Pending', items: [{ name: 'Plywood Sheets',  qty: 3,  price: 1200, gstRate: 18 }] },
  { id: 'INV-1025', customer: 'Kumar & Sons',        phone: '+91 98005 55555', address: '88, GT Road, Kolkata',  date: '22 May 2024', amount: 12000, gst: 2160, status: 'Paid',    items: [{ name: 'Cement Bags',    qty: 20, price: 380,  gstRate: 28 }, { name: 'River Sand', qty: 3, price: 1800, gstRate: 5 }] },
  { id: 'INV-1026', customer: 'Patel Enterprises',   phone: '+91 98006 66666', address: '22, SG Highway, Ahmedabad', date: '21 May 2024', amount: 6400, gst: 1152, status: 'Paid', items: [{ name: 'Steel Rods', qty: 1, price: 6200, gstRate: 18 }] },
]

interface Props {
  invoices: Array<Invoice | InvoiceResponse>
  loading?: boolean
  onView: (inv: Invoice | InvoiceResponse) => void
}

function invoiceId(inv: Invoice | InvoiceResponse) {
  return 'invoiceNumber' in inv ? inv.invoiceNumber : inv.id
}

function invoiceCustomer(inv: Invoice | InvoiceResponse) {
  return 'customerName' in inv ? inv.customerName : inv.customer
}

function invoiceDate(inv: Invoice | InvoiceResponse) {
  return 'createdAt' in inv
    ? new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : inv.date
}

function invoiceAmount(inv: Invoice | InvoiceResponse) {
  return 'grandTotal' in inv ? inv.grandTotal : inv.amount
}

function invoiceStatus(inv: Invoice | InvoiceResponse) {
  if ('invoiceNumber' in inv) {
    if (inv.status === 'PAID') return 'Paid'
    if (inv.status === 'SENT') return 'Pending'
  }
  return inv.status
}

function Badge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#16a34a' : '#ca8a04' }}>{status}</span>
}

export { INITIAL }

export default function InvoiceTable({ invoices, onView }: Props) {
  const [search, setSearch] = useState('')

  const filtered = invoices.filter(inv =>
    invoiceId(inv).toLowerCase().includes(search.toLowerCase()) ||
    invoiceCustomer(inv).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      {/* Table header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>All Invoices</h3>
        <div style={{ position: 'relative', minWidth: 240 }}>
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
              {['Invoice ID', 'Customer Name', 'Date', 'Amount', 'GST', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No invoices found.</td></tr>
            ) : filtered.map(inv => (
              <tr key={invoiceId(inv)} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '13px 20px', fontWeight: 700, color: '#724B68' }}>{invoiceId(inv)}</td>
                <td style={{ padding: '13px 20px', fontWeight: 500, color: '#1F2933' }}>{invoiceCustomer(inv)}</td>
                <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{invoiceDate(inv)}</td>
                <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>₹{invoiceAmount(inv).toLocaleString()}</td>
                <td style={{ padding: '13px 20px' }}>
                  <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>GST Included</span>
                </td>
                <td style={{ padding: '13px 20px' }}><Badge status={invoiceStatus(inv)} /></td>
                <td style={{ padding: '13px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onView(inv)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => { if (!('invoiceNumber' in inv)) downloadPDF(inv) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
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

      <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
        Showing {filtered.length} of {invoices.length} invoices
      </div>
    </div>
  )
}
