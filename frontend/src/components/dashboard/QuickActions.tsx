import { FilePlus, PackagePlus, UserPlus } from 'lucide-react'

const ACTIONS = [
  { icon: FilePlus,   label: 'Create Invoice', color: '#724B68', hover: '#5A3A52' },
  { icon: PackagePlus,label: 'Add Product',    color: '#2563eb', hover: '#1d4ed8' },
  { icon: UserPlus,   label: 'Add Customer',   color: '#059669', hover: '#047857' },
]

export default function QuickActions() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {ACTIONS.map(({ icon: Icon, label, color, hover }) => (
        <button key={label} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: color, color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
          boxShadow: `0 2px 8px ${color}44`,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${color}55` }}
          onMouseLeave={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${color}44` }}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  )
}
