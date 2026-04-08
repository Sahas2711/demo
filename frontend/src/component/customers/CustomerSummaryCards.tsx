import { Users, IndianRupee, UserCheck, FileText } from 'lucide-react'
import type { CustomerResponse } from '../../api/types'

interface Props { customers: CustomerResponse[] }

export default function CustomerSummaryCards({ customers }: Props) {
  const withGstin       = customers.filter(c => c.gstNumber).length
  const activeCount     = customers.filter(c => c.active).length

  const CARDS = [
    { label: 'Total Customers',   value: customers.length.toString(), sub: 'Registered',       icon: Users,       iconBg: 'rgba(114,75,104,0.1)', iconColor: '#724B68', subColor: '#4B5563' },
    { label: 'Active Customers',  value: activeCount.toString(),      sub: 'Currently active', icon: UserCheck,   iconBg: 'rgba(37,99,235,0.1)',  iconColor: '#2563eb', subColor: '#2563eb' },
    { label: 'GST Registered',    value: withGstin.toString(),        sub: 'With GSTIN',       icon: FileText,    iconBg: 'rgba(202,138,4,0.1)',  iconColor: '#ca8a04', subColor: '#ca8a04' },
    { label: 'Credit Limit Total',value: `₹${(customers.reduce((s,c)=>s+c.creditLimit,0)/100000).toFixed(1)}L`, sub: 'Combined limit', icon: IndianRupee, iconBg: 'rgba(5,150,105,0.1)', iconColor: '#059669', subColor: '#059669' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 20 }}>
      {CARDS.map(({ label, value, sub, icon: Icon, iconBg, iconColor, subColor }) => (
        <div key={label} style={{
          background: '#fff', borderRadius: 16, padding: '20px 22px',
          border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 10px 28px rgba(114,75,104,0.12)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={iconColor} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
