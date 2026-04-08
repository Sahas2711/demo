import { useState } from 'react'
import { Search, Eye, Pencil, Trash2 } from 'lucide-react'
import type { CustomerResponse } from '../../api/types'

interface Props {
  customers: CustomerResponse[]
  onView:   (c: CustomerResponse) => void
  onEdit:   (c: CustomerResponse) => void
  onDelete: (id: string)  => void
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_COLORS = ['#724B68','#2563eb','#059669','#ca8a04','#dc2626','#7c3aed']

export default function CustomerTable({ customers, onView, onEdit, onDelete }: Props) {
  const [search, setSearch]     = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.gstNumber ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>All Customers</h3>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input placeholder="Search by name, phone, GSTIN…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#724B68'}
            onBlur={e => e.target.style.borderColor = '#E7E9ED'}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['Customer', 'Phone', 'GSTIN', 'Address', 'Credit Limit', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No customers found.</td></tr>
            ) : filtered.map((c, idx) => (
              <tr key={c.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                {/* Customer name + avatar */}
                <td style={{ padding: '13px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {initials(c.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1F2933' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#4B5563' }}>{c.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 20px', color: '#4B5563' }}>{c.phone}</td>
                <td style={{ padding: '13px 20px' }}>
                  {c.gstNumber
                    ? <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{c.gstNumber}</span>
                    : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
                  }
                </td>
                <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13, maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</div>
                </td>
                <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>
                  ₹{c.creditLimit.toLocaleString()}
                </td>
                <td style={{ padding: '13px 20px' }}>
                  {confirmId === c.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#4B5563' }}>Delete?</span>
                      <button onClick={() => { onDelete(c.id); setConfirmId(null) }} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
                      <button onClick={() => setConfirmId(null)} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>No</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onView(c)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      ><Eye size={13} /> View</button>
                      <button onClick={() => onEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      ><Pencil size={13} /> Edit</button>
                      <button onClick={() => setConfirmId(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                      ><Trash2 size={13} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
        Showing {filtered.length} of {customers.length} customers
      </div>
    </div>
  )
}
