import { useState, useEffect, useCallback } from 'react'
import { Search, UserPlus, Eye, X } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'
import { customerApi } from '../../api/customerApi'
import type { CustomerResponse } from '../../api/types'

const AVATAR_COLORS = ['#724B68', '#2563eb', '#059669', '#ca8a04', '#dc2626', '#7c3aed']

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function CustomerDetailPanel({ customer, onClose }: { customer: CustomerResponse; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Customer Details</h2>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#724B68', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
              {initials(customer.name)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1F2933' }}>{customer.name}</div>
              <div style={{ fontSize: 13, color: '#4B5563' }}>{customer.id}</div>
            </div>
          </div>
          {[
            ['Phone',   customer.phone],
            ['Email',   customer.email || '—'],
            ['Address', customer.address || '—'],
            ['GSTIN',   customer.gstNumber || '—'],
            ['Credit Limit', `₹${customer.creditLimit.toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F6F8', fontSize: 14 }}>
              <span style={{ color: '#4B5563', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#1F2933', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AddCustomerModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [form, setForm]     = useState({ name: '', phone: '', address: '', gstNumber: '', email: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const inp = (f: string): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
    border: `1.5px solid ${focused === f ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused === f ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
  })

  async function handleAdd() {
    if (!form.name || !form.phone) return
    setSaving(true)
    setError(null)
    try {
      const payload: Parameters<typeof customerApi.createCustomer>[0] = { name: form.name.trim(), phone: form.phone.trim() }
      if (form.email.trim())     payload.email     = form.email.trim()
      if (form.address.trim())   payload.address   = form.address.trim()
      if (form.gstNumber.trim()) payload.gstNumber = form.gstNumber.trim().toUpperCase()
      await customerApi.createCustomer(payload)
      onAdd()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || `Error ${err?.response?.status}`
      setError(msg)
    }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Add Customer</h2>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {[
            { key: 'name',      label: 'Name *',          placeholder: 'Customer / Business name' },
            { key: 'phone',     label: 'Phone *',          placeholder: '10-digit number e.g. 9876543210' },
            { key: 'email',     label: 'Email',            placeholder: 'email@example.com' },
            { key: 'address',   label: 'Address',          placeholder: 'Full address' },
            { key: 'gstNumber', label: 'GSTIN (optional)', placeholder: 'e.g. 27ABCDE1234F1Z5' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>{label}</label>
              <input placeholder={placeholder} value={(form as Record<string, string>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={inp(key)} onFocus={() => setFocused(key)} onBlur={() => setFocused(null)} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleAdd} disabled={!form.name || !form.phone || saving} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: form.name && form.phone ? '#724B68' : '#E7E9ED',
              color: form.name && form.phone ? '#fff' : '#9ca3af',
              fontSize: 14, fontWeight: 700, cursor: form.name && form.phone ? 'pointer' : 'not-allowed',
              boxShadow: form.name && form.phone ? '0 4px 14px rgba(114,75,104,0.3)' : 'none',
              fontFamily: 'Poppins, Inter, sans-serif',
            }}>{saving ? 'Saving…' : 'Add Customer'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffCustomersPage() {
  const [customers, setCustomers]       = useState<CustomerResponse[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [viewCustomer, setViewCustomer] = useState<CustomerResponse | null>(null)
  const [showAdd, setShowAdd]           = useState(false)

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerApi.getCustomers({ size: 500 })
      setCustomers(res.data.content)
    } catch { /* handled by interceptor */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.gstNumber ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <StaffLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Customers</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Manage and view your customer records.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none',
          background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(114,75,104,0.3)', transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
        ><UserPlus size={16} /> Add Customer</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>All Customers</h3>
          <div style={{ position: 'relative', minWidth: 260 }}>
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
                {['Customer', 'Phone', 'GSTIN', 'Address', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No customers found.</td></tr>
              ) : filtered.map((c, idx) => (
                <tr key={c.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
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
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</div>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    <button onClick={() => setViewCustomer(c)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fdf9fc'; e.currentTarget.style.borderColor = '#724B68' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E7E9ED' }}
                    ><Eye size={13} /> View</button>
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

      {viewCustomer && <CustomerDetailPanel customer={viewCustomer} onClose={() => setViewCustomer(null)} />}
      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onAdd={fetchCustomers} />}
    </StaffLayout>
  )
}
