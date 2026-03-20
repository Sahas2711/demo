import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import CustomerSummaryCards from '../component/customers/CustomerSummaryCards'
import CustomerTable from '../component/customers/CustomerTable'
import CustomerModal from '../component/customers/CustomerModal'
import CustomerDetailPanel from '../component/customers/CustomerDetailPanel'
import { SEED_CUSTOMERS, type Customer } from '../component/customers/customerData'

type CustomerInput = Omit<Customer, 'id' | 'totalPurchases' | 'purchases'> & { id?: string }

export default function CustomersPage() {
  const [customers, setCustomers]     = useState<Customer[]>(SEED_CUSTOMERS)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)

  function handleSave(data: CustomerInput) {
    if (data.id) {
      setCustomers(prev => prev.map(c => c.id === data.id ? { ...c, ...data, id: c.id } : c))
    } else {
      const newId = `C${String(customers.length + 1).padStart(3, '0')}`
      setCustomers(prev => [{
        id: newId, name: data.name, phone: data.phone,
        address: data.address, gstin: data.gstin,
        totalPurchases: 0, purchases: [],
      }, ...prev])
    }
    setModalOpen(false)
    setEditCustomer(null)
  }

  function handleEdit(c: Customer) {
    setEditCustomer(c)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  function openAdd() {
    setEditCustomer(null)
    setModalOpen(true)
  }

  return (
    <DashboardLayout>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Customer Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Manage customer records, GSTIN details, and purchase history.
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 22px', borderRadius: 10, border: 'none',
          background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
          boxShadow: '0 4px 14px rgba(114,75,104,0.3)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <UserPlus size={17} /> Add Customer
        </button>
      </div>

      {/* Summary cards */}
      <CustomerSummaryCards customers={customers} />

      {/* Customer table */}
      <CustomerTable
        customers={customers}
        onView={c => setViewCustomer(c)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit modal */}
      {modalOpen && (
        <CustomerModal
          customer={editCustomer}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditCustomer(null) }}
        />
      )}

      {/* Detail slide-over */}
      {viewCustomer && (
        <CustomerDetailPanel
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
        />
      )}
    </DashboardLayout>
  )
}
