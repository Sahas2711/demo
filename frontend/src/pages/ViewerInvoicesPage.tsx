import { useState, useMemo } from 'react'
import { Search, Eye, Download, FileText } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'
import InvoiceDetailModal, { downloadPDF, type Invoice } from '../component/billing/InvoiceDetailModal'

const INVOICES: Invoice[] = [
  { id: 'INV-1026', customer: 'Patel Enterprises',  phone: '+91 98006 66666', address: '22, SG Highway, Ahmedabad', date: '21 May 2024', amount: 6400,  gst: 1152, status: 'Paid',    items: [{ name: 'Steel Rods',     qty: 1,  price: 6200, gstRate: 18 }] },
  { id: 'INV-1025', customer: 'Kumar & Sons',        phone: '+91 98005 55555', address: '88, GT Road, Kolkata',     date: '22 May 2024', amount: 12000, gst: 2160, status: 'Paid',    items: [{ name: 'Cement Bags',    qty: 20, price: 380,  gstRate: 28 }, { name: 'River Sand', qty: 3, price: 1800, gstRate: 5 }] },
  { id: 'INV-1024', customer: 'Sharma Builders',     phone: '+91 98004 44444', address: '3, Civil Lines, Delhi',    date: '23 May 2024', amount: 4200,  gst: 756,  status: 'Pending', items: [{ name: 'Plywood Sheets', qty: 3,  price: 1200, gstRate: 18 }] },
  { id: 'INV-1023', customer: 'Ravi Constructions',  phone: '+91 98003 33333', address: '7, NH-48, Chennai',        date: '23 May 2024', amount: 8500,  gst: 1530, status: 'Paid',    items: [{ name: 'Steel Rods',     qty: 1,  price: 6200, gstRate: 18 }, { name: 'PVC Pipes', qty: 5, price: 240, gstRate: 18 }] },
  { id: 'INV-1022', customer: 'Amit Hardware',       phone: '+91 98002 22222', address: '45, Ring Road, Pune',      date: '24 May 2024', amount: 1800,  gst: 324,  status: 'Pending', items: [{ name: 'PVC Pipes',      qty: 6,  price: 240,  gstRate: 18 }] },
  { id: 'INV-1021', customer: 'Rahul Traders',       phone: '+91 98001 11111', address: '12, MG Road, Bengaluru',   date: '24 May 2024', amount: 3200,  gst: 576,  status: 'Paid',    items: [{ name: 'Cement Bags',    qty: 5,  price: 380,  gstRate: 28 }, { name: 'Red Bricks', qty: 200, price: 8, gstRate: 5 }] },
  { id: 'INV-1019', customer: 'Patel Enterprises',  phone: '+91 98006 66666', address: '22, SG Highway, Ahmedabad', date: '20 May 2024', amount: 12000, gst: 2160, status: 'Paid',    items: [{ name: 'Granite Tiles',  qty: 10, price: 950,  gstRate: 18 }] },
  { id: 'INV-1018', customer: 'Kumar & Sons',        phone: '+91 98005 55555', address: '88, GT Road, Kolkata',     date: '21 May 2024', amount: 22000, gst: 3960, status: 'Paid',    items: [{ name: 'TMT Steel Bars', qty: 3,  price: 5800, gstRate: 18 }] },
  { id: 'INV-1017', customer: 'Sharma Builders',     phone: '+91 98004 44444', address: '3, Civil Lines, Delhi',    date: '20 May 2024', amount: 14800, gst: 2664, status: 'Paid',    items: [{ name: 'Portland Cement',qty: 30, price: 420,  gstRate: 28 }] },
  { id: 'INV-1016', customer: 'Ravi Constructions',  phone: '+91 98003 33333', address: '7, NH-48, Chennai',        date: '19 May 2024', amount: 34000, gst: 6120, status: 'Paid',    items: [{ name: 'TMT Steel Bars', qty: 5,  price: 5800, gstRate: 18 }] },
  { id: 'INV-1015', customer: 'Rahul Traders',       phone: '+91 98001 11111', address: '12, MG Road, Bengaluru',   date: '18 May 2024', amount: 18400, gst: 3312, status: 'Paid',    items: [{ name: 'Steel Rods',     qty: 2,  price: 6200, gstRate: 18 }] },
  { id: 'INV-1014', customer: 'Amit Hardware',       phone: '+91 98002 22222', address: '45, Ring Road, Pune',      date: '17 May 2024', amount: 9200,  gst: 1656, status: 'Paid',    items: [{ name: 'CPVC Fittings',  qty: 40, price: 180,  gstRate: 18 }] },
]

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#16a34a' : '#ca8a04' }}>
      {status}
    </span>
  )
}

export default function ViewerInvoicesPage() {
  const [search, setSearch] = useState('')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return INVOICES.filter(inv =>
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <ViewerLayout>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Invoices
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            View and download invoices — read-only access.
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      {/* Search */}
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
          {filtered.length} of {INVOICES.length} invoices
        </span>
      </div>

      {/* ── Desktop / Tablet Table ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }} className="viewer-table-wrap">
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
              {filtered.length === 0 ? (
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
                      <button
                        onClick={() => setViewInvoice(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => downloadPDF(inv)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F8'; e.currentTarget.style.borderColor = '#4B5563' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                        title="Download PDF"
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
        <div style={{ padding: '12px 18px', borderTop: '1px solid #F5F6F8', fontSize: 12, color: '#9ca3af' }}>
          Showing {filtered.length} of {INVOICES.length} invoices
        </div>
      </div>

      {/* ── Mobile Card Layout ── */}
      <div className="viewer-cards-wrap" style={{ display: 'none', flexDirection: 'column', gap: 12 }}>
        {filtered.map(inv => (
          <div key={inv.id}
            style={{ background: '#fff', borderRadius: 14, border: '1px solid #E7E9ED', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#724B68' }}>{inv.id}</span>
              <StatusBadge status={inv.status} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#1F2933', marginBottom: 4 }}>{inv.customer}</div>
            <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 12 }}>{inv.date}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Amount</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1F2933' }}>₹{inv.amount.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>GST</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#4B5563' }}>₹{inv.gst.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setViewInvoice(inv)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 9, border: '1.5px solid #724B68', background: '#fff', fontSize: 13, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf9fc'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <Eye size={14} /> View
              </button>
              <button
                onClick={() => downloadPDF(inv)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 9, border: 'none', background: '#724B68', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </ViewerLayout>
  )
}
