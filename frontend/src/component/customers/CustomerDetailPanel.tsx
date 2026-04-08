import { X, Phone, MapPin, FileText, IndianRupee } from 'lucide-react'
import type { CustomerResponse } from '../../api/types'

interface Props { customer: CustomerResponse; onClose: () => void }

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function CustomerDetailPanel({ customer, onClose }: Props) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 190 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%', maxWidth: 440,
        background: '#fff', zIndex: 200, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease both',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Customer Details</h2>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#724B68,#5A3A52)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
              {initials(customer.name)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>{customer.name}</div>
              <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>Customer ID: {customer.id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              { icon: Phone,    label: 'Phone',   value: customer.phone },
              { icon: MapPin,   label: 'Address', value: customer.address || '—' },
              { icon: FileText, label: 'GSTIN',   value: customer.gstNumber || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#F5F6F8', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(114,75,104,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="#724B68" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#1F2933', fontWeight: 500, marginTop: 2 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: IndianRupee, label: 'Credit Limit', value: `₹${customer.creditLimit.toLocaleString()}`, color: '#724B68' },
              { icon: FileText,    label: 'Status',       value: customer.active ? 'Active' : 'Inactive',     color: customer.active ? '#059669' : '#6b7280' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #E7E9ED', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                <Icon size={16} color={color} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'Poppins, Inter, sans-serif' }}>{value}</div>
                <div style={{ fontSize: 11, color: '#4B5563', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
