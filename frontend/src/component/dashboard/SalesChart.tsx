import { useState, useEffect } from 'react'
import { billingApi } from '../../api/billingApi'
import type { InvoiceResponse } from '../../api/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildMonthly(invoices: InvoiceResponse[]) {
  const map: Record<string, number> = {}
  for (const inv of invoices) {
    const m = MONTHS[new Date(inv.createdAt).getMonth()]
    map[m] = (map[m] ?? 0) + inv.grandTotal
  }
  return MONTHS.map(m => ({ month: m, value: map[m] ?? 0 }))
}

const W = 600, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 48 }
const chartW = W - PAD.left - PAD.right
const chartH = H - PAD.top - PAD.bottom
const yTicks = [0, 10000, 20000, 30000, 40000]

export default function SalesChart() {
  const [data, setData]     = useState(MONTHS.map(m => ({ month: m, value: 0 })))
  const [loading, setLoading] = useState(true)
  const [total, setTotal]   = useState(0)

  useEffect(() => {
    billingApi.getInvoices({ size: 500 })
      .then(res => {
        const monthly = buildMonthly(res.data.content)
        setData(monthly)
        setTotal(res.data.content.reduce((s, i) => s + i.grandTotal, 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const xFn = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const yFn = (v: number) => PAD.top + chartH - (v / maxVal) * chartH
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xFn(i)},${yFn(d.value)}`).join(' ')
  const area = `${line} L${xFn(data.length - 1)},${H - PAD.bottom} L${xFn(0)},${H - PAD.bottom} Z`

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Monthly Sales Overview
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4B5563' }}>
            {loading ? 'Loading…' : `Total: ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          Live data
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#724B68" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#724B68" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(v => (
          <g key={`tick-${v}`}>
            <line x1={PAD.left} y1={yFn(v)} x2={W - PAD.right} y2={yFn(v)} stroke="#E7E9ED" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={yFn(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {v === 0 ? '0' : `₹${v / 1000}k`}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="#724B68" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={`pt-${d.month}`}>
            <circle cx={xFn(i)} cy={yFn(d.value)} r="4" fill="#fff" stroke="#724B68" strokeWidth="2" />
            <text x={xFn(i)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
