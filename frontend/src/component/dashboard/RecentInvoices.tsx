import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '../../api/axiosInstance'

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  totalAmount: number
  createdAt: string
  status: 'PAID' | 'PENDING' | 'CANCELLED'
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    PAID:      { bg: '#dcfce7', color: '#16a34a', label: 'Paid'      },
    PENDING:   { bg: '#fef9c3', color: '#ca8a04', label: 'Pending'   },
    CANCELLED: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
  }
  const s = cfg[status] ?? cfg.PENDING
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get<{ content: Invoice[] } | Invoice[]>('/v1/invoices', {
      params: { page: 0, size: 5, sort: 'createdAt,desc' },
    })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.content
        setInvoices((data ?? []).slice(0, 5))
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
          Recent Invoices
        </h3>
        <Link to="/dashboard/invoices" style={{ fontSize: 12, color: '#724B68', fontWeight: 600, textDecoration: 'none' }}>
          View All →
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#724B68', gap: 8 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Invoice ID', 'Customer', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No invoices yet.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 24px', fontWeight: 700, color: '#724B68' }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '13px 24px', color: '#1F2933', fontWeight: 500 }}>{inv.customerName}</td>
                  <td style={{ padding: '13px 24px', fontWeight: 700, color: '#1F2933' }}>₹{inv.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '13px 24px', color: '#4B5563', fontSize: 13 }}>{formatDate(inv.createdAt)}</td>
                  <td style={{ padding: '13px 24px' }}><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
