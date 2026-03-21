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
        <Route path="/dashboard/*" element={<AdminDashboard />} />

        {/* Staff routes */}
        <Route path="/staff" element={<StaffDashboardPage />} />
        <Route path="/staff/create-invoice" element={<StaffCreateInvoicePage />} />
        <Route path="/staff/invoices" element={<StaffInvoicesPage />} />
        <Route path="/staff/customers" element={<StaffCustomersPage />} />
        <Route path="/staff/products" element={<StaffProductsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
