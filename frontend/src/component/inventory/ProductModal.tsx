import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Product, Category } from './inventoryData'

interface SavePayload {
  id?: string
  name: string
  description: string
  hsnCode: string
  unitPrice: number
  gstPercentage: number
  categoryId: string
  quantityAvailable: number
  reorderLevel: number
}

interface Props {
  product?: Product | null
  categories: Category[]
  saving?: boolean
  onSave: (p: SavePayload) => void
  onClose: () => void
}

const GST_SLABS = [0, 5, 12, 18, 28]

export default function ProductModal({ product, categories, saving, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: '', description: '', hsnCode: '', unitPrice: '',
    gstPercentage: '18', categoryId: '', quantityAvailable: '', reorderLevel: '10',
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || '',
        hsnCode: product.hsnCode,
        unitPrice: String(product.unitPrice),
        gstPercentage: String(product.gstPercentage),
        categoryId: product.category?.id || '',
        quantityAvailable: String(product.quantityAvailable),
        reorderLevel: String(product.reorderLevel),
      })
    } else {
      setForm({
        name: '', description: '', hsnCode: '', unitPrice: '',
        gstPercentage: '18', categoryId: categories[0]?.id || '',
        quantityAvailable: '', reorderLevel: '10',
      })
    }
    setErrors({})
  }, [product, categories])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                       e.name = 'Product name is required'
    if (!form.hsnCode.trim())                    e.hsnCode = 'HSN code is required'
    if (!form.unitPrice || Number(form.unitPrice) < 0)  e.unitPrice = 'Enter a valid price'
    if (!form.categoryId)                        e.categoryId = 'Select a category'
    if (form.quantityAvailable === '' || Number(form.quantityAvailable) < 0) e.quantityAvailable = 'Enter valid quantity'
    if (form.reorderLevel === '' || Number(form.reorderLevel) < 0) e.reorderLevel = 'Enter valid reorder level'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      id: product?.id,
      name: form.name.trim(),
      description: form.description.trim(),
      hsnCode: form.hsnCode.trim(),
      unitPrice: Number(form.unitPrice),
      gstPercentage: Number(form.gstPercentage),
      categoryId: form.categoryId,
      quantityAvailable: Number(form.quantityAvailable),
      reorderLevel: Number(form.reorderLevel),
    })
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
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.25s ease both', maxHeight: '90vh', overflowY: 'auto' }}>

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
            {lbl('Product Name *')}
            <input aria-label="Product Name" type="text" placeholder="e.g. Cement Bags" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              style={inp('name', !!errors.name)} />
            {err('name')}
          </div>

          {/* Description */}
          <div>
            {lbl('Description')}
            <textarea aria-label="Description" placeholder="Product description (optional)" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
              rows={2}
              style={{ ...inp('desc', false), resize: 'vertical' } as any} />
          </div>

          {/* HSN Code + Category row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {lbl('HSN Code *')}
              <input aria-label="HSN Code" type="text" placeholder="e.g. 2523" value={form.hsnCode}
                onChange={e => setForm(f => ({ ...f, hsnCode: e.target.value }))}
                onFocus={() => setFocused('hsn')} onBlur={() => setFocused(null)}
                style={inp('hsn', !!errors.hsnCode)} />
              {err('hsnCode')}
            </div>
            <div>
              {lbl('Category *')}
              <select aria-label="Category" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)}
                style={{ ...inp('cat', !!errors.categoryId), appearance: 'none', cursor: 'pointer' }}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {err('categoryId')}
            </div>
          </div>

          {/* Price + GST row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {lbl('Unit Price (₹) *')}
              <input aria-label="Unit Price" type="number" min={0} step="0.01" placeholder="380" value={form.unitPrice}
                onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                onFocus={() => setFocused('price')} onBlur={() => setFocused(null)}
                style={inp('price', !!errors.unitPrice)} />
              {err('unitPrice')}
            </div>
            <div>
              {lbl('GST %')}
              <select aria-label="GST Percentage" value={form.gstPercentage} onChange={e => setForm(f => ({ ...f, gstPercentage: e.target.value }))}
                onFocus={() => setFocused('gst')} onBlur={() => setFocused(null)}
                style={{ ...inp('gst', false), appearance: 'none', cursor: 'pointer' }}>
                {GST_SLABS.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>

          {/* Stock + Reorder row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {lbl('Stock Quantity *')}
              <input aria-label="Stock Quantity" type="number" min={0} placeholder="100" value={form.quantityAvailable}
                onChange={e => setForm(f => ({ ...f, quantityAvailable: e.target.value }))}
                onFocus={() => setFocused('stock')} onBlur={() => setFocused(null)}
                style={inp('stock', !!errors.quantityAvailable)} />
              {err('quantityAvailable')}
            </div>
            <div>
              {lbl('Reorder Level *')}
              <input aria-label="Reorder Level" type="number" min={0} placeholder="10" value={form.reorderLevel}
                onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))}
                onFocus={() => setFocused('reorder')} onBlur={() => setFocused(null)}
                style={inp('reorder', !!errors.reorderLevel)} />
              {err('reorderLevel')}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} disabled={saving} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 26px', borderRadius: 10, border: 'none',
              background: saving ? '#9ca3af' : '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(114,75,104,0.3)',
              transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}}
            >
              {saving && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
