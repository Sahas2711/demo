import { useState } from 'react'
import { PackagePlus, AlertTriangle, X } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import InventorySummaryCards from '../component/inventory/InventorySummaryCards'
import InventoryTableFull from '../component/inventory/InventoryTableFull'
import ProductModal from '../component/inventory/ProductModal'
import { SEED_PRODUCTS, LOW_STOCK_THRESHOLD, type Product } from '../component/inventory/inventoryData'

export default function InventoryPage() {
  const [products, setProducts]       = useState<Product[]>(SEED_PRODUCTS)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const lowStockItems = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0)
  const outOfStock    = products.filter(p => p.stock === 0)

  function handleSave(data: Omit<Product, 'id'> & { id?: string }) {
    if (data.id) {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data, id: p.id } : p))
    } else {
      const newId = `P${String(products.length + 1).padStart(3, '0')}`
      setProducts(prev => [{ ...data, id: newId } as Product, ...prev])
    }
    setModalOpen(false)
    setEditProduct(null)
  }

  function handleEdit(p: Product) {
    setEditProduct(p)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function openAdd() {
    setEditProduct(null)
    setModalOpen(true)
  }

  return (
    <DashboardLayout>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Inventory Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Manage products, track stock levels, and monitor inventory health.
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
          <PackagePlus size={17} /> Add Product
        </button>
      </div>

      {/* Low stock alert banner */}
      {!alertDismissed && (lowStockItems.length > 0 || outOfStock.length > 0) && (
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12,
          padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12,
          animation: 'fadeInUp 0.3s ease both',
        }}>
          <AlertTriangle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#9a3412', marginBottom: 4 }}>
              Stock Alert — Action Required
            </div>
            <div style={{ fontSize: 13, color: '#c2410c', lineHeight: 1.6 }}>
              {outOfStock.length > 0 && (
                <span><strong>{outOfStock.length} product{outOfStock.length > 1 ? 's' : ''}</strong> out of stock: {outOfStock.map(p => p.name).join(', ')}. </span>
              )}
              {lowStockItems.length > 0 && (
                <span><strong>{lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''}</strong> running low: {lowStockItems.map(p => `${p.name} (${p.stock})`).join(', ')}.</span>
              )}
            </div>
          </div>
          <button onClick={() => setAlertDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea580c', padding: 2, display: 'flex', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <InventorySummaryCards products={products} />

      {/* Inventory table */}
      <InventoryTableFull products={products} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Add / Edit modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditProduct(null) }}
        />
      )}
    </DashboardLayout>
  )
}
