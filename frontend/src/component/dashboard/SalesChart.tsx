import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '../../api/axiosInstance'

interface MonthSales { month: string; value: number }

const FALLBACK: MonthSales[] = [
  { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 }, { month: 'May', value: 0 }, { month: 'Jun', value: 0 },
  { month: 'Jul', value: 0 }, { month: 'Aug', value: 0 }, { month: 'Sep', value: 0 },
  { month: 'Oct', value: 0 }, { month: 'Nov', value: 0 }, { month: 'Dec', value: 0 },
]

const W = 600, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 48 }
const chartW = W - PAD.left - PAD.right
const chartH = H - PAD.top - PAD.bottom

function buildChart(data: MonthSales[]) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const xFn = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const yFn = (v: number) => PAD.top + chartH - (v / maxVal) * chartH
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xFn(i)},${yFn(d.value)}`).join(' ')
  const area = `${line} L${xFn(data.length - 1)},${H - PAD.bottom} L${xFn(0)},${H - PAD.bottom} Z`
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map(v => Math.round(v))
  return { xFn, yFn, line, area, yTicks, maxVal }
}

export default function SalesChart() {
  const [data, setData]     = useState<MonthSales[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [growth, setGrowth]   = useState<string | null>(null)

  useEffect(() => {
    api.get<{ monthlySales: MonthSales[]; growthPercent?: number }>('/v1/dashboard/sales-chart')
      .then(res => {
        if (res.data.monthlySales?.length) setData(res.data.monthlySales)
        if (res.data.growthPercent != null)
          setGrowth(`${res.data.growthPercent >= 0 ? '+' : ''}${res.data.growthPercent}% vs last year`)
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setLoading(false))
  }, [])

  const { xFn, yFn, line, area, yTicks } = buildChart(data)
  const currentYear = new Date().getFullYear()

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Monthly Sales Overview
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4B5563' }}>Jan – Dec {currentYear}</p>
        </div>
        {growth && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            {growth}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 8, color: '#724B68' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading chart…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#724B68" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#724B68" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={yFn(v)} x2={W - PAD.right} y2={yFn(v)}
                stroke="#E7E9ED" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.left - 8} y={yFn(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}k`}
              </text>
            </g>
          ))}

          <path d={area} fill="url(#areaGrad)" />
          <path d={line} fill="none" stroke="#724B68" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {data.map((d, i) => (
            <g key={i}>
              <circle cx={xFn(i)} cy={yFn(d.value)} r="4" fill="#fff" stroke="#724B68" strokeWidth="2" />
              <text x={xFn(i)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">
                {d.month}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
