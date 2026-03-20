import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Product } from './inventoryData'
import { CATEGORIES } from './inventoryData'

interface Props {
  product?: Product | null
  onSave: (p: Omit<Product, 'id'> & { id?: string }) => void
  onClose: () => void
}

const EMPTY = { name: '', category: 'Cement', price: '', gst: '18', stock: '' }

export default function ProductModal({ product, onSave, onClose }: Props) {
  const [form, setForm]     = useState(EMPTY)
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setForm({ name: product.name, category: product.category, price: String(product.price), gst: String(product.gst), stock: String(product.stock) })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [product])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())          e.name  = 'Product name is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price'
    if (!form.stock || Number(form.stock) < 0)  e.stock = 'Enter a valid quantity'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ id: product?.id, name: form.name.trim(), category: form.category, price: Number(form.price), gst: Number(form.gst), stock: Number(form.stock) })
  }

  const inp = (f: string, hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? '#ef4444' : focused === f ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused === f ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'Poppins, Inter, sans-serif',
  })

  const lbl = (text: string) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>{text}</label>
  )

  const err = (f: string) => errors[f]
    ? <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>{errors[f]}</span>
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.25s ease both' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>
              {product ? 'Update product details.' : 'Add a new product to inventory.'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Product Name */}
          <div>
            {lbl('Product Name')}
            <input type="text" placeholder="e.g. Cement Bags" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              style={inp('name', !!errors.name)} />
            {err('name')}
          </div>

          {/* Category */}
          <div>
            {lbl('Category')}
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)}
              style={{ ...inp('cat', false), appearance: 'none', cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price + GST row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {lbl('Price (₹)')}
              <input type="number" min={0} placeholder="380" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                onFocus={() => setFocused('price')} onBlur={() => setFocused(null)}
                style={inp('price', !!errors.price)} />
              {err('price')}
            </div>
            <div>
              {lbl('GST %')}
              <select value={form.gst} onChange={e => setForm(f => ({ ...f, gst: e.target.value }))}
                onFocus={() => setFocused('gst')} onBlur={() => setFocused(null)}
                style={{ ...inp('gst', false), appearance: 'none', cursor: 'pointer' }}>
                {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            {lbl('Stock Quantity')}
            <input type="number" min={0} placeholder="100" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              onFocus={() => setFocused('stock')} onBlur={() => setFocused(null)}
              style={inp('stock', !!errors.stock)} />
            {err('stock')}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Cancel</button>
            <button onClick={handleSave} style={{
              padding: '10px 26px', borderRadius: 10, border: 'none',
              background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(114,75,104,0.3)',
              transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Save Product</button>
          </div>
        </div>
      </div>
    </div>
  )
}
