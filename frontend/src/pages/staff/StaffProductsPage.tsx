import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'
import { SEED_PRODUCTS, CATEGORIES, LOW_STOCK_THRESHOLD } from '../../component/inventory/inventoryData'

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}>Out of Stock</span>
  if (stock <= LOW_STOCK_THRESHOLD)
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fef9c3', color: '#ca8a04' }}>Low Stock</span>
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>In Stock</span>
}

export default function StaffProductsPage() {
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const filtered = SEED_PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'All' || p.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <StaffLayout>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Products</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Browse available products and stock levels.</p>
      </div>

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
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F5F6F8' }}>
                {['Product Name', 'Category', 'Price', 'GST %', 'Stock Qty', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1F2933' }}>{p.name}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ background: '#F5F6F8', padding: '3px 10px', borderRadius: 6, fontSize: 12, color: '#4B5563', fontWeight: 500 }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{p.gst}%</span>
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: p.stock <= LOW_STOCK_THRESHOLD ? 700 : 400, color: p.stock <= LOW_STOCK_THRESHOLD ? '#dc2626' : '#1F2933' }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: '13px 20px' }}><StockBadge stock={p.stock} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
          Showing {filtered.length} of {SEED_PRODUCTS.length} products
        </div>
      </div>
    </StaffLayout>
  )
}
