import { useState, useEffect } from 'react'
import { Plus, Trash2, Printer, CheckCircle } from 'lucide-react'
import StaffLayout from '../../component/staff/StaffLayout'
import { downloadPDF } from '../../component/billing/InvoiceDetailModal'
import type { Invoice } from '../../component/billing/InvoiceDetailModal'
import { customerApi } from '../../api/customerApi'
import { inventoryApi } from '../../api/inventoryApi'
import { billingApi } from '../../api/billingApi'
import type { CustomerResponse, ProductResponse } from '../../api/types'

interface LineItem { productId: string; product: string; qty: number; price: number; gstRate: number }

const inp = (focused: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 12px', borderRadius: 8, boxSizing: 'border-box',
  border: `1.5px solid ${focused ? '#724B68' : '#E7E9ED'}`,
  fontSize: 14, color: '#1F2933', background: focused ? '#fdf9fc' : '#fff',
  outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
})

function Label({ text }: { text: string }) {
  return <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>{text}</label>
}
function SectionTitle({ text }: { text: string }) {
  return <p style={{ fontSize: 12, fontWeight: 700, color: '#724B68', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{text}</p>
}

export default function StaffCreateInvoicePage() {
  const [customers, setCustomers]   = useState<CustomerResponse[]>([])
  const [products, setProducts]     = useState<ProductResponse[]>([])
  const [customerId, setCustomerId] = useState('')
  const [customer, setCustomer]     = useState('')
  const [phone, setPhone]           = useState('')
  const [address, setAddress]       = useState('')
  const [gstin, setGstin]           = useState('')
  const [items, setItems]           = useState<LineItem[]>([{ productId: '', product: '', qty: 1, price: 0, gstRate: 18 }])
  const [focused, setFocused]       = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [custSearch, setCustSearch] = useState('')
  const [showCustDrop, setShowCustDrop] = useState(false)

  useEffect(() => {
    customerApi.getCustomers({ size: 500 }).then(r => setCustomers(r.data.content)).catch(() => {})
    inventoryApi.getProducts({ size: 500 }).then(r => setProducts(r.data.content)).catch(() => {})
  }, [])

  const filteredCusts = customers.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
    c.phone.includes(custSearch)
  )

  function selectCustomer(c: CustomerResponse) {
    setCustomerId(c.id)
    setCustomer(c.name)
    setPhone(c.phone)
    setAddress(c.address ?? '')
    setGstin(c.gstNumber ?? '')
    setCustSearch(c.name)
    setShowCustDrop(false)
  }

  function updateItem(idx: number, field: keyof LineItem, val: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'productId') {
        const found = products.find(p => p.id === val)
        return { ...item, productId: val as string, product: found?.name ?? '', price: found?.unitPrice ?? 0, gstRate: Number(found?.gstPercentage ?? 18) }
      }
      return { ...item, [field]: val }
    }))
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const gstTotal = items.reduce((s, i) => s + i.qty * i.price * i.gstRate / 100, 0)
  const total    = subtotal + gstTotal
  const canGenerate = !!customerId && items.every(i => i.productId && i.qty > 0)

  function buildInvoice(): Invoice {
    return {
      id: `INV-${Date.now()}`,
      customer, phone, address,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: total, gst: gstTotal, status: 'Paid',
      items: items.map(i => ({ name: i.product, qty: i.qty, price: i.price, gstRate: i.gstRate })),
    }
  }

  async function handleGenerate() {
    if (!canGenerate) return
    setSaving(true)
    try {
      await billingApi.createInvoice({
        customerId,
        interState: false,
        items: items.map(i => ({ productId: i.productId, quantity: i.qty })),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setCustomerId(''); setCustomer(''); setCustSearch('')
      setPhone(''); setAddress(''); setGstin('')
      setItems([{ productId: '', product: '', qty: 1, price: 0, gstRate: 18 }])
    } catch { /* toast handled by interceptor */ }
    finally { setSaving(false) }
  }

  function handlePrintDownload() {
    if (!canGenerate) return
    downloadPDF(buildInvoice())
  }

  return (
    <StaffLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>Create Invoice</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>Generate a GST invoice for your customer.</p>
        </div>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
          <CheckCircle size={18} /> Invoice created successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }} className="invoice-grid">

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Customer */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle text="Customer Details" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Customer search dropdown */}
              <div style={{ position: 'relative' }}>
                <Label text="Customer Name *" />
                <input
                  placeholder="Search customer…"
                  value={custSearch}
                  onChange={e => { setCustSearch(e.target.value); setCustomer(e.target.value); setShowCustDrop(true) }}
                  onFocus={() => setShowCustDrop(true)}
                  onBlur={() => setTimeout(() => setShowCustDrop(false), 150)}
                  style={inp(focused === 'cust')}
                  onFocusCapture={() => setFocused('cust')}
                  onBlurCapture={() => setFocused(null)}
                />
                {showCustDrop && filteredCusts.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #E7E9ED', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                    {filteredCusts.map(c => (
                      <div key={c.id} onMouseDown={() => selectCustomer(c)}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, color: '#1F2933', borderBottom: '1px solid #F5F6F8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fdf9fc'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: '#4B5563' }}>{c.phone}{c.gstNumber ? ` · ${c.gstNumber}` : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label text="Phone" />
                <input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}
                  style={inp(focused === 'phone')} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <Label text="Address" />
                <input placeholder="Customer address" value={address} onChange={e => setAddress(e.target.value)}
                  style={inp(focused === 'addr')} onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <Label text="GSTIN (optional)" />
                <input placeholder="e.g. 27ABCDE1234F1Z5" value={gstin} onChange={e => setGstin(e.target.value)}
                  style={inp(focused === 'gstin')} onFocus={() => setFocused('gstin')} onBlur={() => setFocused(null)} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle text="Products" />
            <div style={{ border: '1px solid #E7E9ED', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F5F6F8' }}>
                    {['Product', 'Qty', 'Unit Price', 'GST %', 'Amount', ''].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #F5F6F8' }}>
                      <td style={{ padding: '8px 10px', minWidth: 180 }}>
                        <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', background: '#fff', outline: 'none', fontFamily: 'Poppins, Inter, sans-serif' }}>
                          <option value="">Select product…</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantityAvailable})</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '8px 10px', width: 72 }}>
                        <input type="number" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E7E9ED', fontSize: 13, color: '#1F2933', outline: 'none', textAlign: 'center' }} />
                      </td>
                      <td style={{ padding: '8px 12px', color: '#4B5563', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {item.price > 0 ? `₹${item.price.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.gstRate}%</span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1F2933', whiteSpace: 'nowrap' }}>
                        ₹{(item.qty * item.price).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {items.length > 1 && (
                          <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setItems(prev => [...prev, { productId: '', product: '', qty: 1, price: 0, gstRate: 18 }])}
              style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #724B68', borderRadius: 8, padding: '8px 16px', color: '#724B68', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} /> Add Item
            </button>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <SectionTitle text="GST Summary" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Subtotal',  `₹${subtotal.toLocaleString()}`],
                ['CGST',      `₹${(gstTotal / 2).toFixed(2)}`],
                ['SGST',      `₹${(gstTotal / 2).toFixed(2)}`],
                ['Total GST', `₹${gstTotal.toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4B5563' }}>
                  <span>{k}</span><span style={{ fontWeight: 600, color: '#1F2933' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #E7E9ED', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#1F2933' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: '#724B68' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={!canGenerate || saving} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: canGenerate ? '#724B68' : '#E7E9ED',
            color: canGenerate ? '#fff' : '#9ca3af',
            fontSize: 15, fontWeight: 700, cursor: canGenerate ? 'pointer' : 'not-allowed',
            boxShadow: canGenerate ? '0 4px 14px rgba(114,75,104,0.3)' : 'none',
            transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
          }}>
            {saving ? 'Creating…' : 'Generate Invoice'}
          </button>

          <button onClick={handlePrintDownload} disabled={!canGenerate} style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: `1.5px solid ${canGenerate ? '#724B68' : '#E7E9ED'}`,
            background: '#fff', color: canGenerate ? '#724B68' : '#9ca3af',
            fontSize: 14, fontWeight: 600, cursor: canGenerate ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
          }}>
            <Printer size={16} /> Print / Download
          </button>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .invoice-grid { grid-template-columns: 1fr !important; } }`}</style>
    </StaffLayout>
  )
}
