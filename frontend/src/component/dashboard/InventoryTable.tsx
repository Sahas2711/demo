import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import type { Product } from '../inventory/inventoryData'
import api from '../../api/axiosInstance'

function Badge({ product }: { product: Product }) {
  if (product.quantityAvailable === 0)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}>Out of Stock</span>
  if (product.lowStock)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fef9c3', color: '#ca8a04' }}>Low Stock</span>
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>In Stock</span>
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/v1/products', { params: { page: 0, size: 6, sort: 'quantityAvailable,asc' } })
        setProducts((res.data.content || res.data).filter((p: Product) => p.active).slice(0, 6))
      } catch {
        // fail silently — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
          Inventory Overview
        </h3>
        <Link to="/dashboard/inventory" style={{ fontSize: 12, color: '#724B68', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>View All →</Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#724B68', gap: 8 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Product Name', 'Category', 'Stock Qty', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No products yet.</td></tr>
              ) : products.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 24px', fontWeight: 600, color: '#1F2933' }}>{p.name}</td>
                  <td style={{ padding: '13px 24px', color: '#4B5563' }}>
                    <span style={{ background: '#F5F6F8', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>{p.category?.name || '—'}</span>
                  </td>
                  <td style={{ padding: '13px 24px', color: p.lowStock ? '#dc2626' : '#1F2933', fontWeight: p.lowStock ? 700 : 400 }}>
                    {p.quantityAvailable}
                  </td>
                  <td style={{ padding: '13px 24px' }}><Badge product={p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
