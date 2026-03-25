import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import BillingPage from './pages/BillingPage'
import InventoryPage from './pages/InventoryPage'
import CustomersPage from './pages/CustomersPage'
import UserManagementPage from './pages/UserManagementPage'
import ReportsPage from './pages/ReportsPage'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'
import StaffCreateInvoicePage from './pages/staff/StaffCreateInvoicePage'
import StaffInvoicesPage from './pages/staff/StaffInvoicesPage'
import StaffCustomersPage from './pages/staff/StaffCustomersPage'
import StaffProductsPage from './pages/staff/StaffProductsPage'
import ViewerDashboard from './pages/ViewerDashboard'
import ViewerInvoicesPage from './pages/ViewerInvoicesPage'
import ViewerGSTCalculatorPage from './pages/ViewerGSTCalculatorPage'
import ViewerReportsPage from './pages/ViewerReportsPage'
import ViewerAnalyticsPage from './pages/ViewerAnalyticsPage'
import ViewerProfilePage from './pages/ViewerProfilePage'
import StaffProfilePage from './pages/staff/StaffProfilePage'
import AdminProfilePage from './pages/AdminProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/invoices" element={<BillingPage />} />
        <Route path="/dashboard/inventory" element={<InventoryPage />} />
        <Route path="/dashboard/customers" element={<CustomersPage />} />
        <Route path="/dashboard/users" element={<UserManagementPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/profile" element={<AdminProfilePage />} />
        <Route path="/dashboard/*" element={<AdminDashboard />} />

        {/* Staff routes */}
        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/staff/create-invoice" element={<StaffCreateInvoicePage />} />
        <Route path="/staff/invoices" element={<StaffInvoicesPage />} />
        <Route path="/staff/customers" element={<StaffCustomersPage />} />
        <Route path="/staff/products" element={<StaffProductsPage />} />
        <Route path="/staff/profile" element={<StaffProfilePage />} />

        {/* Viewer routes */}
        <Route path="/viewer" element={<ViewerDashboard />} />
        <Route path="/viewer/invoices" element={<ViewerInvoicesPage />} />
        <Route path="/viewer/reports" element={<ViewerReportsPage />} />
        <Route path="/viewer/analytics" element={<ViewerAnalyticsPage />} />
        <Route path="/viewer/gst-calculator" element={<ViewerGSTCalculatorPage />} />
        <Route path="/viewer/profile" element={<ViewerProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App