import { FilePlus, PackagePlus, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  { icon: FilePlus,    label: 'Create Invoice', color: '#724B68', hover: '#5A3A52', path: '/dashboard/invoices' },
  { icon: PackagePlus, label: 'Add Product',    color: '#724B68', hover: '#5A3A52', path: '/dashboard/inventory' },
  { icon: UserPlus,    label: 'Add Customer',   color: '#724B68', hover: '#5A3A52', path: '/dashboard/customers' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ACTIONS.map(({ icon: Icon, label, color, hover, path }) => (
        <button key={label} onClick={() => navigate(path)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: color, color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
          boxShadow: `0 2px 8px ${color}44`, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  )
}
