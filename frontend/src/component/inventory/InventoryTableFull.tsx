import { useState } from 'react'
import { Search, Pencil, Trash2, Filter, PackagePlus } from 'lucide-react'
import type { ProductResponse as Product } from '../../api/types'

interface Props {
  products: Product[]
  loading?: boolean
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onStockAdjust?: (productId: string, qty: number, reorderLevel: number) => void
}

function StockBadge({ product }: { product: Product }) {
  if (product.quantityAvailable === 0) {
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}>Out of Stock</span>
  }
  if (product.lowStock) {
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fef9c3', color: '#ca8a04' }}>Low Stock</span>
  }
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>In Stock</span>
}

export default function InventoryTableFull({ products, onEdit, onDelete, onStockAdjust }: Props) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [stockEditId, setStockEditId] = useState<string | null>(null)
  const [stockQty, setStockQty] = useState('')

  const categories = Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)))

  const filtered = products.filter((p) => {
    if (!p.active) return false
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.hsnCode || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || p.category?.name === catFilter
    return matchSearch && matchCat
  })

  function handleDelete(id: string) {
    onDelete(id)
    setConfirmId(null)
  }

  function handleStockSave(product: Product) {
    if (onStockAdjust && stockQty !== '') {
      onStockAdjust(product.id, Number(stockQty), product.reorderLevel)
    }
    setStockEditId(null)
    setStockQty('')
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginRight: 'auto' }}>
          All Products
        </h3>

        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search product or HSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: 8,
              border: '1.5px solid #E7E9ED',
              fontSize: 13,
              color: '#1F2933',
              background: '#F5F6F8',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'Poppins, Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#724B68'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E7E9ED'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#4B5563" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1.5px solid #E7E9ED',
              fontSize: 13,
              color: '#1F2933',
              background: '#F5F6F8',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, Inter, sans-serif',
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['Product Name', 'HSN Code', 'Category', 'Price', 'GST %', 'Stock Qty', 'Reorder Lvl', 'Status', 'Actions'].map((header) => (
                <th key={header} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fdf9fc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1F2933' }}>
                    {p.name}
                    {p.description && (
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400, marginTop: 2 }}>
                        {p.description.slice(0, 60)}
                        {p.description.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '13px 20px', fontFamily: 'monospace', fontSize: 13, color: '#4B5563' }}>{p.hsnCode}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ background: '#F5F6F8', padding: '3px 10px', borderRadius: 6, fontSize: 12, color: '#4B5563', fontWeight: 500 }}>{p.category?.name || '-'}</span>
                  </td>
                  <td style={{ padding: '13px 20px', fontWeight: 700, color: '#1F2933' }}>Rs.{Number(p.unitPrice).toLocaleString()}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{Number(p.gstPercentage)}%</span>
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    {stockEditId === p.id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                          aria-label={`Stock quantity for ${p.name}`}
                          type="number"
                          min={0}
                          value={stockQty}
                          onChange={(e) => setStockQty(e.target.value)}
                          style={{ width: 70, padding: '4px 6px', borderRadius: 6, border: '1.5px solid #724B68', fontSize: 13, outline: 'none', textAlign: 'center' }}
                          autoFocus
                        />
                        <button onClick={() => handleStockSave(p)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setStockEditId(null)
                            setStockQty('')
                          }}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E7E9ED', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#4B5563' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: p.lowStock ? 700 : 400, color: p.lowStock ? '#dc2626' : '#1F2933' }}>{p.quantityAvailable}</span>
                        {onStockAdjust && (
                          <button
                            onClick={() => {
                              setStockEditId(p.id)
                              setStockQty(String(p.quantityAvailable))
                            }}
                            title="Adjust stock"
                            aria-label={`Adjust stock for ${p.name}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#724B68', padding: 2, display: 'flex' }}
                          >
                            <PackagePlus size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: '#4B5563' }}>{p.reorderLevel}</td>
                  <td style={{ padding: '13px 20px' }}>
                    <StockBadge product={p} />
                  </td>
                  <td style={{ padding: '13px 20px' }}>
                    {confirmId === p.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#4B5563' }}>Delete?</span>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Yes
                        </button>
                        <button onClick={() => setConfirmId(null)} style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>
                          No
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => onEdit(p)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#724B68', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fdf9fc'
                            e.currentTarget.style.borderColor = '#724B68'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.borderColor = '#E7E9ED'
                          }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmId(p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 12, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fff5f5'
                            e.currentTarget.style.borderColor = '#ef4444'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff'
                            e.currentTarget.style.borderColor = '#E7E9ED'
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F6F8', fontSize: 13, color: '#4B5563' }}>
        Showing {filtered.length} of {products.filter((p) => p.active).length} products
      </div>
    </div>
  )
}
