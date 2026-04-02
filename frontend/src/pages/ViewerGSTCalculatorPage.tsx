import { useState, useEffect } from 'react'
import { Calculator, IndianRupee, Percent, Eye } from 'lucide-react'
import ViewerLayout from '../component/viewer/ViewerLayout'

const GST_RATES = [0, 5, 12, 18, 28]

const PRESETS = [
  { label: 'Essential Goods', rate: 5,  color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
  { label: 'Standard',        rate: 12, color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
  { label: 'Standard Plus',   rate: 18, color: '#724B68', bg: 'rgba(114,75,104,0.08)' },
  { label: 'Luxury / Sin',    rate: 28, color: '#ca8a04', bg: 'rgba(202,138,4,0.08)'  },
]

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: '#fff',
    border: '1px solid #E7E9ED',
    borderRadius: 16,
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    ...extra,
  }
}

function ResultRow({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F6F8' }}>
      <span style={{ fontSize: 13, color: '#4B5563', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 18 : 14, fontWeight: bold ? 800 : 600, color: color ?? '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>{value}</span>
    </div>
  )
}

export default function ViewerGSTCalculatorPage() {
  const [amount, setAmount]     = useState('')
  const [rate, setRate]         = useState(18)
  const [mode, setMode]         = useState<'exclusive' | 'inclusive'>('exclusive')
  const [result, setResult]     = useState<{ base: number; gst: number; total: number } | null>(null)

  useEffect(() => {
    const val = parseFloat(amount)
    if (!val || val <= 0) { setResult(null); return }
    if (mode === 'exclusive') {
      const gst   = (val * rate) / 100
      setResult({ base: val, gst, total: val + gst })
    } else {
      const base  = (val * 100) / (100 + rate)
      const gst   = val - base
      setResult({ base, gst, total: val })
    }
  }, [amount, rate, mode])

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const cgst  = result ? result.gst / 2 : 0
  const sgst  = result ? result.gst / 2 : 0
  const igst  = result ? result.gst     : 0

  return (
    <ViewerLayout>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            GST Calculator
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
            Calculate GST inclusive &amp; exclusive amounts instantly.
          </p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(5,150,105,0.08)', color: '#059669', padding: '6px 14px', borderRadius: 20, fontWeight: 600, alignSelf: 'center' }}>
          <Eye size={13} /> Read Only
        </span>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }} className="gst-grid">

        {/* ── Input Card ── */}
        <div style={card()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ background: '#724B68', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Input</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#4B5563' }}>Enter amount and select GST rate</p>
            </div>
          </div>

          {/* Amount */}
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
            Amount (₹)
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <IndianRupee size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', padding: '11px 14px 11px 36px', borderRadius: 10, border: '1.5px solid #E7E9ED', fontSize: 15, fontWeight: 600, color: '#1F2933', outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s', background: '#FAFAFA' }}
              onFocus={e => e.currentTarget.style.borderColor = '#724B68'}
              onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
            />
          </div>

          {/* GST Rate */}
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
            GST Rate
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Percent size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              style={{ width: '100%', padding: '11px 14px 11px 34px', borderRadius: 10, border: '1.5px solid #E7E9ED', fontSize: 14, fontWeight: 600, color: '#1F2933', outline: 'none', appearance: 'none', background: '#FAFAFA', cursor: 'pointer', fontFamily: 'Poppins, Inter, sans-serif', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#724B68'}
              onBlur={e => e.currentTarget.style.borderColor = '#E7E9ED'}
            >
              {GST_RATES.map(r => (
                <option key={r} value={r}>{r}% GST{r === 0 ? ' (Exempt)' : r === 5 ? ' — Essential' : r === 12 ? ' — Standard' : r === 18 ? ' — Standard Plus' : ' — Luxury'}</option>
              ))}
            </select>
          </div>

          {/* Mode Toggle */}
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
            Calculation Mode
          </label>
          <div style={{ display: 'flex', background: '#F5F6F8', borderRadius: 10, padding: 4, gap: 4, marginBottom: 24 }}>
            {(['exclusive', 'inclusive'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'Poppins, Inter, sans-serif',
                  background: mode === m ? '#724B68' : 'transparent',
                  color: mode === m ? '#fff' : '#4B5563',
                  transition: 'all 0.2s',
                  boxShadow: mode === m ? '0 2px 8px rgba(114,75,104,0.25)' : 'none',
                }}
              >
                {m === 'exclusive' ? 'Exclusive GST' : 'Inclusive GST'}
              </button>
            ))}
          </div>

          {/* Mode hint */}
          <div style={{ background: 'rgba(114,75,104,0.06)', border: '1px solid rgba(114,75,104,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#724B68', lineHeight: 1.5 }}>
            {mode === 'exclusive'
              ? '📌 GST will be added on top of the entered amount.'
              : '📌 GST is already included in the entered amount.'}
          </div>
        </div>

        {/* ── Result Card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#059669', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Result</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#4B5563' }}>Calculated breakdown</p>
              </div>
            </div>

            {result ? (
              <>
                <ResultRow label="Base Amount"  value={fmt(result.base)}  />
                <ResultRow label={`GST (${rate}%)`} value={fmt(result.gst)} color="#724B68" />
                <div style={{ paddingTop: 4 }}>
                  <ResultRow label="Total Amount" value={fmt(result.total)} bold color="#059669" />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                <Calculator size={36} color="#E7E9ED" style={{ display: 'block', margin: '0 auto 10px' }} />
                <span style={{ fontSize: 13 }}>Enter an amount to see results</span>
              </div>
            )}
          </div>

          {/* GST Breakdown */}
          <div style={card()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>GST Breakdown</h3>

            {[
              { label: 'CGST', value: cgst, pct: 50, color: '#724B68' },
              { label: 'SGST', value: sgst, pct: 50, color: '#2563eb' },
            ].map(({ label, value, pct, color }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{label} ({rate / 2}%)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{result ? fmt(value) : '—'}</span>
                </div>
                <div style={{ height: 6, background: '#F5F6F8', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: result ? `${pct}%` : '0%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px dashed #E7E9ED' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>IGST ({rate}%) <span style={{ fontSize: 11, color: '#9ca3af' }}>(inter-state)</span></span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{result ? fmt(igst) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Presets ── */}
      <div style={card({ padding: '20px 24px' })}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Quick Presets</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.rate}
              onClick={() => setRate(p.rate)}
              style={{
                padding: '10px 20px', borderRadius: 10, border: `1.5px solid`,
                borderColor: rate === p.rate ? p.color : '#E7E9ED',
                background: rate === p.rate ? p.bg : '#fff',
                color: rate === p.rate ? p.color : '#4B5563',
                fontSize: 13, fontWeight: rate === p.rate ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
              }}
              onMouseEnter={e => { if (rate !== p.rate) { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.color = p.color; e.currentTarget.style.background = p.bg } }}
              onMouseLeave={e => { if (rate !== p.rate) { e.currentTarget.style.borderColor = '#E7E9ED'; e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = '#fff' } }}
            >
              {p.rate}% — {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .gst-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </ViewerLayout>
  )
}
