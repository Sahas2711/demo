import { useState, useEffect, useCallback } from 'react'
import { PackagePlus, AlertTriangle, X, Loader2 } from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'
import InventorySummaryCards from '../component/inventory/InventorySummaryCards'
import InventoryTableFull from '../component/inventory/InventoryTableFull'
import ProductModal from '../component/inventory/ProductModal'
import type { Product, Category } from '../component/inventory/inventoryData'
import api from '../api/axiosInstance'

export default function InventoryPage() {
  const [products, setProducts]       = useState<Product[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [saving, setSaving]           = useState(false)

  // ── Fetch products + categories from backend ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [prodRes, catRes] = await Promise.all([
        api.get('/v1/products', { params: { page: 0, size: 500 } }),
        api.get('/v1/categories'),
      ])
      setProducts(prodRes.data.content || prodRes.data)
      setCategories(catRes.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Low stock / out of stock alerts ──
  const lowStockItems = products.filter(p => p.lowStock && p.quantityAvailable > 0)
  const outOfStock    = products.filter(p => p.quantityAvailable === 0 && p.active)

  // ── Save (create or update) ──
  async function handleSave(data: {
    id?: string
    name: string
    description: string
    hsnCode: string
    unitPrice: number
    gstPercentage: number
    categoryId: string
    quantityAvailable: number
    reorderLevel: number
  }) {
    try {
      setSaving(true)
      setError(null)
      const payload = {
        name: data.name,
        description: data.description,
        hsnCode: data.hsnCode,
        unitPrice: data.unitPrice,
        gstPercentage: data.gstPercentage,
        categoryId: data.categoryId,
        quantityAvailable: data.quantityAvailable,
        reorderLevel: data.reorderLevel,
        active: true,
      }
      if (data.id) {
        await api.put(`/v1/products/${data.id}`, payload)
      } else {
        await api.post('/v1/products', payload)
      }
      await fetchData()
      setModalOpen(false)
      setEditProduct(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ──
  function handleEdit(p: Product) {
    setEditProduct(p)
    setModalOpen(true)
  }

  // ── Delete (deactivate) ──
  async function handleDelete(id: string) {
    try {
      setError(null)
      await api.delete(`/v1/products/${id}`)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  // ── Stock adjustment ──
  async function handleStockAdjust(productId: string, quantityAvailable: number, reorderLevel: number) {
    try {
      setError(null)
      await api.put(`/v1/inventory/${productId}`, { quantityAvailable, reorderLevel })
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock')
    }
  }

  function openAdd() {
    setEditProduct(null)
    setModalOpen(true)
  }

  // ── Loading state ──
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#724B68', gap: 10 }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Loading inventory…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </DashboardLayout>
    )
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

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#dc2626', fontSize: 14, fontWeight: 500,
        }}>
          <AlertTriangle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      )}

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
                <span><strong>{outOfStock.length} product{outOfStock.length > 1 ? 's' : ''}</strong> out of stock. </span>
              )}
              {lowStockItems.length > 0 && (
                <span><strong>{lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''}</strong> running low on stock.</span>
              )}
            </div>
          </div>
          <button onClick={() => setAlertDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea580c', padding: 2, display: 'flex', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <InventorySummaryCards products={products} categories={categories} />

      {/* Inventory table */}
      <InventoryTableFull
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStockAdjust={handleStockAdjust}
      />

      {/* Add / Edit modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          categories={categories}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditProduct(null) }}
        />
      )}
    </DashboardLayout>
  )
}
