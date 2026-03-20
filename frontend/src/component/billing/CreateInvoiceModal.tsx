import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Invoice } from './InvoiceDetailModal'

const CUSTOMERS = ['Rahul Traders', 'Amit Hardware', 'Ravi Constructions', 'Sharma Builders', 'Kumar & Sons']
const PRODUCTS = [
  { name: 'Cement Bags',    price: 380,  gstRate: 28 },
  { name: 'Steel Rods',     price: 6200, gstRate: 18 },
  { name: 'PVC Pipes',      price: 240,  gstRate: 18 },
  { name: 'Red Bricks',     price: 8,    gstRate: 5  },
  { name: 'River Sand',     price: 1800, gstRate: 5  },
  { name: 'Plywood Sheets', price: 1200, gstRate: 18 },
]

interface LineItem { product: string; qty: number; price: number; gstRate: number }
interface Props { onClose: () => void; onGenerate: (inv: Invoice) => void }

export default function CreateInvoiceModal({ onClose, onGenerate }: Props) {
  const [customer, setCustomer]   = useState('')
  const [phone, setPhone]         = useState('')
  const [address, setAddress]     = useState('')
  const [items, setItems]         = useState<LineItem[]>([{ product: '', qty: 1, price: 0, gstRate: 18 }])
  const [focused, setFocused]     = useState<string | null>(null)

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const gstTotal = items.reduce((s, i) => s + i.qty * i.price * i.gstRate / 100, 0)
  const total    = subtotal + gstTotal

  function updateItem(idx: number, field: keyof LineItem, val: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'product') {
        const found = PRODUCTS.find(p => p.name === val)
        return { ...item, product: val as string, price: found?.price ?? 0, gstRate: found?.gstRate ?? 18 }
      }
      return { ...item, [field]: val }
    }))
  }

  function addItem() { setItems(prev => [...prev, { product: '', qty: 1, price: 0, gstRate: 18 }]) }
  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)) }

  function handleGenerate() {
    if (!customer || items.some(i => !i.product)) return
    const id = `INV-${1025 + Math.floor(Math.random() * 100)}`
    onGenerate({
      id, customer, phone, address,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: total, gst: gstTotal, status: 'Paid',
      items: items.map(i => ({ name: i.product, qty: i.qty, price: i.price, gstRate: i.gstRate })),
    })
    onClose()
  }

  const inp = (f: string): React.CSSProperties => ({
    width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
    border: `1.5px solid ${focused === f ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused === f ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
  })

  const lbl = (t: string) => <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>{t}</label>

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeInUp 0.3s ease both' }}>

        {/* Header */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Create Invoice</h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>Fill in the details to generate a GST invoice.</p>
          </div>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Customer section */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#724B68', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                {lbl('Customer Name')}
                <select value={customer} onChange={e => setCustomer(e.target.value)}
                  onFocus={() => setFocused('cust')} onBlur={() => setFocused(null)}
                  style={{ ...inp('cust'), appearance: 'none' }}>
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                {lbl('Phone Number')}
                <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} style={inp('phone')} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              {lbl('Address')}
              <input type="text" placeholder="Customer address" value={address} onChange={e => setAddress(e.target.value)}
                onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)} style={inp('addr')} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#724B68', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products</p>
            <div style={{ border: '1px solid #E7E9ED', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F5F6F8' }}>
                    {['Product', 'Qty', 'Unit Price', 'GST%', 'Amount', ''].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #F5F6F8' }}>
                      <td style={{ padding: '8px 10px', minWidth: 160 }}>
                        <select value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#fff', outline: 'none', fontFamily: 'Poppins, Inter, sans-serif' }}>
                          <option value="">Select…</option>
                          {PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px 10px', width: 70 }}>
                        <input type="number" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', outline: 'none', textAlign: 'center', fontFamily: 'Poppins, Inter, sans-serif' }} />
                      </td>
                      <td style={{ padding: '8px 10px', color: '#4B5563', fontWeight: 500 }}>₹{item.price.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.gstRate}%</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1F2933' }}>₹{(item.qty * item.price).toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>
                        {items.length > 1 && (
                          <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #724B68', borderRadius: 8, padding: '8px 16px', color: '#724B68', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} /> Add Item
            </button>
          </div>

          {/* GST Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280, background: '#F5F6F8', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Summary</p>
              {[
                ['Subtotal', `₹${subtotal.toLocaleString()}`],
                ['CGST', `₹${(gstTotal / 2).toFixed(2)}`],
                ['SGST', `₹${(gstTotal / 2).toFixed(2)}`],
                ['Total GST', `₹${gstTotal.toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563' }}>
                  <span>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #E7E9ED', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#1F2933' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#724B68' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '11px 24px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleGenerate} disabled={!customer || items.some(i => !i.product)} style={{
              padding: '11px 28px', borderRadius: 10, border: 'none',
              background: !customer ? '#E7E9ED' : '#724B68',
              color: !customer ? '#9ca3af' : '#fff',
              fontSize: 14, fontWeight: 700, cursor: !customer ? 'not-allowed' : 'pointer',
              boxShadow: customer ? '0 4px 14px rgba(114,75,104,0.3)' : 'none',
              transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            }}
              onMouseEnter={e => { if (customer) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = !customer ? '#E7E9ED' : '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
