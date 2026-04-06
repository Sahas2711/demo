import { useState, useEffect } from 'react'
import { TrendingUp, FileText, Package, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../api/axiosInstance'

interface DashboardStats {
  totalSales: number
  totalInvoices: number
  pendingInvoices: number
  totalProducts: number
  totalCategories: number
  lowStockCount: number
}

const CARD_META = [
  { key: 'totalSales',    label: 'Total Sales',       icon: TrendingUp,    iconBg: 'rgba(114,75,104,0.1)', iconColor: '#724B68', subColor: '#16a34a',  format: (v: number) => `₹${v.toLocaleString()}`,  sub: (s: DashboardStats) => `${s.totalInvoices} invoices total` },
  { key: 'totalInvoices', label: 'Total Invoices',    icon: FileText,      iconBg: 'rgba(37,99,235,0.1)',  iconColor: '#2563eb', subColor: '#ca8a04',  format: (v: number) => `${v}`,                     sub: (s: DashboardStats) => `${s.pendingInvoices} pending` },
  { key: 'totalProducts', label: 'Inventory Items',   icon: Package,       iconBg: 'rgba(5,150,105,0.1)',  iconColor: '#059669', subColor: '#4B5563',  format: (v: number) => `${v}`,                     sub: (s: DashboardStats) => `${s.totalCategories} categories` },
  { key: 'lowStockCount', label: 'Low Stock Alerts',  icon: AlertTriangle, iconBg: 'rgba(239,68,68,0.1)',  iconColor: '#ef4444', subColor: '#ef4444',  format: (v: number) => `${v}`,                     sub: () => 'Needs restock' },
]

// Fallback static values shown while loading or on error
const FALLBACK: DashboardStats = {
  totalSales: 0, totalInvoices: 0, pendingInvoices: 0,
  totalProducts: 0, totalCategories: 0, lowStockCount: 0,
}

export default function StatsCards() {
  const [stats, setStats]   = useState<DashboardStats>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardStats>('/v1/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {/* keep fallback */})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
      {CARD_META.map(({ key, label, icon: Icon, iconBg, iconColor, subColor, format, sub }) => (
        <div key={key} style={{
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

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44 }}>
              <Loader2 size={18} color="#724B68" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 6 }}>
                {format(stats[key as keyof DashboardStats] as number)}
              </div>
              <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub(stats)}</div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
