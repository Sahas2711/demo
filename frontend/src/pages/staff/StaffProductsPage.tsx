import { useState, useEffect } from 'react'
import { Search, Filter, Loader2 } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'
import type { ProductResponse as Product } from '../../api/types'
import api from '../../api/axiosInstance'

function StockBadge({ product }: { product: Product }) {
  if (product.quantityAvailable === 0)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}>Out of Stock</span>
  if (product.lowStock)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fef9c3', color: '#ca8a04' }}>Low Stock</span>
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>In Stock</span>
}

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('All')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/v1/products', { params: { page: 0, size: 500 } })
        setProducts(res.data.content || res.data)
      } catch {
        // fail silently — empty list
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeProducts = products.filter(p => p.active)
  const categories = Array.from(new Set(activeProducts.map(p => p.category?.name).filter(Boolean)))

  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.hsnCode || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || p.category?.name === catFilter
    return matchSearch && matchCat
  })

  return (
    <StaffLayout>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Products</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Browse available products and stock levels.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#724B68', gap: 10 }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>Loading products…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginRight: 'auto' }}>All Products</h3>

            <div style={{ position: 'relative', minWidth: 220 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input placeholder="Search product…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#724B68'}
                onBlur={e => e.target.style.borderColor = '#E7E9ED'}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="#4B5563" />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
                padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E7E9ED',
                fontSize: 13, color: '#1F2933', background: '#F5F6F8', outline: 'none',
                cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif',
              }}>
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F5F6F8' }}>
                  {['Product Name', 'HSN Code', 'Category', 'Price', 'GST %', 'Stock Qty', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No products found.</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1F2933' }}>{p.name}</td>
                    <td style={{ padding: '13px 20px', fontFamily: 'monospace', fontSize: 13, color: '#4B5563' }}>{p.hsnCode}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ background: '#F5F6F8', padding: '3px 10px', borderRadius: 6, fontSize: 12, color: '#4B5563', fontWeight: 500 }}>{p.category?.name || '—'}</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>₹{Number(p.unitPrice).toLocaleString()}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{Number(p.gstPercentage)}%</span>
                    </td>
                    <td style={{ padding: '13px 20px', fontWeight: p.lowStock ? 700 : 400, color: p.lowStock ? '#dc2626' : '#1F2933' }}>
                      {p.quantityAvailable}
                    </td>
                    <td style={{ padding: '13px 20px' }}><StockBadge product={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
            Showing {filtered.length} of {activeProducts.length} products
          </div>
        </div>
      )}
    </StaffLayout>
  )
}
