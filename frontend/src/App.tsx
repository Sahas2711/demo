import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute'

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
import AdminProfilePage from './pages/AdminProfilePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Admin routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/invoices" element={<ProtectedRoute allowedRoles={['ADMIN']}><BillingPage /></ProtectedRoute>} />
          <Route path="/dashboard/inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><InventoryPage /></ProtectedRoute>} />
          <Route path="/dashboard/customers" element={<ProtectedRoute allowedRoles={['ADMIN']}><CustomersPage /></ProtectedRoute>} />
          <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* Staff routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffDashboardPage /></ProtectedRoute>} />
          <Route path="/staff/create-invoice" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffCreateInvoicePage /></ProtectedRoute>} />
          <Route path="/staff/invoices" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffInvoicesPage /></ProtectedRoute>} />
          <Route path="/staff/customers" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffCustomersPage /></ProtectedRoute>} />
          <Route path="/staff/products" element={<ProtectedRoute allowedRoles={['STAFF']}><StaffProductsPage /></ProtectedRoute>} />

          {/* Viewer routes */}
          <Route path="/viewer" element={<ProtectedRoute allowedRoles={['VIEWER']}><ViewerDashboard /></ProtectedRoute>} />
          <Route path="/viewer/invoices" element={<ProtectedRoute allowedRoles={['VIEWER']}><ViewerInvoicesPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App