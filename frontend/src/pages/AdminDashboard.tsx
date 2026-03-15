import { useState } from 'react'
import Sidebar from '../component/dashboard/Sidebar'
import TopBar from '../component/dashboard/TopBar'
import StatsCards from '../component/dashboard/StatsCards'
import SalesChart from '../component/dashboard/SalesChart'
import InventoryTable from '../component/dashboard/InventoryTable'
import RecentInvoices from '../component/dashboard/RecentInvoices'
import QuickActions from '../component/dashboard/QuickActions'

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F6F8', fontFamily: 'Poppins, Inter, sans-serif' }}>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 15, display: 'none',
        }} className="sidebar-overlay" />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${mobileSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>

          {/* Page header */}
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

          {/* Stats */}
          <StatsCards />

          {/* Chart */}
          <SalesChart />

          {/* Tables row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="tables-grid">
            <InventoryTable />
            <RecentInvoices />
          </div>
        </main>
      </div>
    </div>
  )
}
