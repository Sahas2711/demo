import { useState, useEffect, useCallback } from 'react'
import { UserPlus } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import CustomerSummaryCards from '../component/customers/CustomerSummaryCards'
import CustomerTable from '../component/customers/CustomerTable'
import CustomerModal from '../component/customers/CustomerModal'
import CustomerDetailPanel from '../component/customers/CustomerDetailPanel'
import { customerApi } from '../api/customerApi'
import type { CustomerResponse } from '../api/types'

export default function CustomersPage() {
  const [customers, setCustomers]       = useState<CustomerResponse[]>([])
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editCustomer, setEditCustomer] = useState<CustomerResponse | null>(null)
  const [viewCustomer, setViewCustomer] = useState<CustomerResponse | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customerApi.getCustomers({ size: 200 })
      setCustomers(res.data.content)
    } catch { /* handled by interceptor */ }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const res = await customerApi.getCustomers({ size: 200 })
        setCustomers(res.data.content)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  async function handleSave(data: Parameters<typeof customerApi.createCustomer>[0] & { id?: string }) {
    if (data.id) {
      await customerApi.updateCustomer(data.id, data)
    } else {
      await customerApi.createCustomer(data)
    }
    await fetchCustomers()
    setModalOpen(false)
    setEditCustomer(null)
  }

  async function handleDelete(id: string) {
    await customerApi.deleteCustomer(id)
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  function handleEdit(c: CustomerResponse) {
    setEditCustomer(c)
    setModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Customer Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Manage customer records, GSTIN details, and purchase history.
          </p>
        </div>
        <button onClick={() => { setEditCustomer(null); setModalOpen(true) }} style={{
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

      <CustomerSummaryCards customers={customers} />
      <CustomerTable customers={customers} loading={loading} onView={c => setViewCustomer(c)} onEdit={handleEdit} onDelete={handleDelete} />

      {modalOpen && (
        <CustomerModal
          customer={editCustomer}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditCustomer(null) }}
        />
      )}

      {viewCustomer && (
        <CustomerDetailPanel customer={viewCustomer} onClose={() => setViewCustomer(null)} />
      )}
    </DashboardLayout>
  )
}
