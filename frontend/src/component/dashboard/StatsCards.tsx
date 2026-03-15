import { TrendingUp, FileText, Package, AlertTriangle } from 'lucide-react'

const CARDS = [
  {
    label: 'Total Sales',
    value: '₹45,200',
    sub: '+12% this month',
    icon: TrendingUp,
    iconBg: 'rgba(114,75,104,0.1)',
    iconColor: '#724B68',
    subColor: '#16a34a',
  },
  {
    label: 'Total Invoices',
    value: '120',
    sub: '8 pending',
    icon: FileText,
    iconBg: 'rgba(37,99,235,0.1)',
    iconColor: '#2563eb',
    subColor: '#ca8a04',
  },
  {
    label: 'Inventory Items',
    value: '320',
    sub: '12 categories',
    icon: Package,
    iconBg: 'rgba(5,150,105,0.1)',
    iconColor: '#059669',
    subColor: '#4B5563',
  },
  {
    label: 'Low Stock Alerts',
    value: '8',
    sub: 'Needs restock',
    icon: AlertTriangle,
    iconBg: 'rgba(239,68,68,0.1)',
    iconColor: '#ef4444',
    subColor: '#ef4444',
  },
]

export default function StatsCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 20,
    }}>
      {CARDS.map(({ label, value, sub, icon: Icon, iconBg, iconColor, subColor }) => (
        <div key={label} style={{
          background: '#fff', borderRadius: 16, padding: '22px 24px',
          border: '1px solid #E7E9ED',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.transform = 'translateY(-3px)'
            el.style.boxShadow = '0 10px 28px rgba(114,75,104,0.13)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={iconColor} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 6 }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
