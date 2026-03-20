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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/invoices" element={<BillingPage />} />
        <Route path="/dashboard/inventory" element={<InventoryPage />} />
        <Route path="/dashboard/customers" element={<CustomersPage />} />
        <Route path="/dashboard/users" element={<UserManagementPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
