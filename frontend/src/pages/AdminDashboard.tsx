import DashboardLayout from '../component/dashboard/DashboardLayout'
import StatsCards from '../component/dashboard/StatsCards'
import SalesChart from '../component/dashboard/SalesChart'
import InventoryTable from '../component/dashboard/InventoryTable'
import RecentInvoices from '../component/dashboard/RecentInvoices'
import QuickActions from '../component/dashboard/QuickActions'

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Welcome back, Admin 👋 Here's what's happening today.
          </p>
        </div>
        <QuickActions />
      </div>
      <StatsCards />
      <SalesChart />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="tables-grid">
        <InventoryTable />
        <RecentInvoices />
      </div>
    </DashboardLayout>
  )
}
