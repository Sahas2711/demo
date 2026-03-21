import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingCart, FilePlus, UserPlus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'

const TODAY_STATS = [
  { label: "Today's Sales",   value: '₹12,400', sub: '6 invoices',     icon: TrendingUp,   iconBg: 'rgba(114,75,104,0.1)', iconColor: '#724B68', subColor: '#4B5563' },
  { label: 'Orders Today',    value: '6',        sub: '2 pending',      icon: ShoppingCart, iconBg: 'rgba(37,99,235,0.1)',  iconColor: '#2563eb', subColor: '#ca8a04' },
  { label: 'Cash Collected',  value: '₹9,800',   sub: '₹2,600 pending', icon: CheckCircle,  iconBg: 'rgba(5,150,105,0.1)', iconColor: '#059669', subColor: '#ef4444' },
  { label: 'Low Stock Items', value: '8',        sub: 'Needs attention', icon: AlertCircle,  iconBg: 'rgba(239,68,68,0.1)', iconColor: '#ef4444', subColor: '#ef4444' },
]

const RECENT_TXN = [
  { id: 'INV-1031', customer: 'Rahul Traders',     amount: 3200,  status: 'Paid',    time: '10:32 AM' },
  { id: 'INV-1030', customer: 'Amit Hardware',      amount: 1800,  status: 'Pending', time: '09:55 AM' },
  { id: 'INV-1029', customer: 'Ravi Constructions', amount: 8500,  status: 'Paid',    time: '09:20 AM' },
  { id: 'INV-1028', customer: 'Sharma Builders',    amount: 4200,  status: 'Paid',    time: '08:45 AM' },
  { id: 'INV-1027', customer: 'Kumar & Sons',       amount: 12000, status: 'Pending', time: '08:10 AM' },
]

function Badge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: paid ? '#dcfce7' : '#fef9c3', color: paid ? '#16a34a' : '#ca8a04' }}>
      {status}
    </span>
  )
}

export default function StaffDashboardPage() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <StaffLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Staff Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Welcome back 👋 Here's your activity for today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Create Invoice', path: '/staff/create-invoice', color: '#724B68', hover: '#5A3A52', icon: FilePlus },
            { label: 'Add Customer',   path: '/staff/customers',      color: '#059669', hover: '#047857', icon: UserPlus },
          ].map(({ label, path, color, hover, icon: Icon }) => (
            <button key={label} onClick={() => navigate(path)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: hovered === label ? hover : color,
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Poppins, Inter, sans-serif',
              boxShadow: `0 2px 8px ${color}44`, transition: 'all 0.2s',
            }}
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {TODAY_STATS.map(({ label, value, sub, icon: Icon, iconBg, iconColor, subColor }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 16, padding: '22px 24px',
            border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 10px 28px rgba(114,75,104,0.13)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label}</div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={iconColor} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="#724B68" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Recent Transactions</h3>
          </div>
          <button onClick={() => navigate('/staff/invoices')} style={{
            background: 'none', border: '1.5px solid #E7E9ED', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#724B68', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#724B68'; e.currentTarget.style.background = '#fdf9fc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.background = 'none' }}
          >
            View All
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Invoice ID', 'Customer', 'Time', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TXN.map(txn => (
                <tr key={txn.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#724B68' }}>{txn.id}</td>
                  <td style={{ padding: '13px 20px', fontWeight: 500, color: '#1F2933' }}>{txn.customer}</td>
                  <td style={{ padding: '13px 20px', color: '#4B5563', fontSize: 13 }}>{txn.time}</td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>₹{txn.amount.toLocaleString()}</td>
                  <td style={{ padding: '13px 20px' }}><Badge status={txn.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  )
}
