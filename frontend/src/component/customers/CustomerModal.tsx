import { useState, useEffect } from 'react'
import { X, User, Phone, MapPin, FileText } from 'lucide-react'
import type { CustomerResponse, CustomerRequest } from '../../api/types'

type CustomerInput = CustomerRequest & { id?: string }

interface Props {
  customer?: CustomerResponse | null
  onSave: (c: CustomerInput) => void
  onClose: () => void
}

const EMPTY = { name: '', phone: '', email: '', address: '', gstNumber: '' }

export default function CustomerModal({ customer, onSave, onClose }: Props) {
  const [form, setForm]       = useState(EMPTY)
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  useEffect(() => {
    setForm(customer ? { name: customer.name, phone: customer.phone, email: customer.email ?? '', address: customer.address ?? '', gstNumber: customer.gstNumber ?? '' } : EMPTY)
    setErrors({})
  }, [customer])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                          e.name  = 'Customer name is required'
    if (!/^\d{10}$/.test(form.phone))               e.phone = 'Enter a valid 10-digit phone number'
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber))
      e.gstNumber = 'Invalid GSTIN format'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const payload: Parameters<typeof onSave>[0] = {
      id: customer?.id,
      name: form.name.trim(),
      phone: form.phone,
      address: form.address.trim() || undefined,
      gstNumber: form.gstNumber.trim().toUpperCase() || undefined,
    }
    if (form.email.trim()) payload.email = form.email.trim()
    onSave(payload)
  }

  const inp = (f: string, hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8, boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? '#ef4444' : focused === f ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused === f ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'Poppins, Inter, sans-serif',
  })

  const is: React.CSSProperties = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }
  const ic = (f: string) => focused === f ? '#724B68' : '#9ca3af'
  const lbl = (t: string, opt = false) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>
      {t}{opt && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (optional)</span>}
    </label>
  )
  const err = (f: string) => errors[f]
    ? <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>{errors[f]}</span>
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.25s ease both' }}>

        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
              {customer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>
              {customer ? 'Update customer details.' : 'Add a new customer record.'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            {lbl('Customer Name')}
            <div style={{ position: 'relative' }}>
              <User size={15} color={ic('name')} style={is} />
              <input type="text" placeholder="e.g. Rahul Traders" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                style={inp('name', !!errors.name)} />
            </div>
            {err('name')}
          </div>

          {/* Phone */}
          <div>
            {lbl('Phone Number')}
            <div style={{ position: 'relative' }}>
              <Phone size={15} color={ic('phone')} style={is} />
              <input type="tel" placeholder="10-digit mobile number" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                style={inp('phone', !!errors.phone)} />
            </div>
            {err('phone')}
          </div>

          {/* Address */}
          <div>
            {lbl('Address')}
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color={ic('addr')} style={{ ...is, top: 14, transform: 'none' }} />
              <textarea placeholder="Shop / business address" value={form.address} rows={2}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)}
                style={{ ...inp('addr', !!errors.address), paddingTop: 10, resize: 'none', lineHeight: 1.5 }} />
            </div>
            {err('address')}
          </div>

          {/* GSTIN */}
          <div>
            {lbl('GSTIN', true)}
            <div style={{ position: 'relative' }}>
              <FileText size={15} color={ic('gstin')} style={is} />
              <input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstNumber}
                onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase().slice(0, 15) }))}
                onFocus={() => setFocused('gstin')} onBlur={() => setFocused(null)}
                style={inp('gstin', !!errors.gstNumber)} />
            </div>
            {err('gstNumber')}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Cancel</button>
            <button onClick={handleSave} style={{
              padding: '10px 26px', borderRadius: 10, border: 'none',
              background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(114,75,104,0.3)',
              transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Save Customer</button>
          </div>
        </div>
      </div>
    </div>
  )
}
