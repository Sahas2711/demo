const DATA = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 15000 },
  { month: 'Apr', value: 22000 },
  { month: 'May', value: 19000 },
  { month: 'Jun', value: 27000 },
  { month: 'Jul', value: 24000 },
  { month: 'Aug', value: 31000 },
  { month: 'Sep', value: 28000 },
  { month: 'Oct', value: 35000 },
  { month: 'Nov', value: 32000 },
  { month: 'Dec', value: 45200 },
]

const W = 600, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 48 }
const chartW = W - PAD.left - PAD.right
const chartH = H - PAD.top - PAD.bottom
const maxVal = Math.max(...DATA.map(d => d.value))

function x(i: number) { return PAD.left + (i / (DATA.length - 1)) * chartW }
function y(v: number) { return PAD.top + chartH - (v / maxVal) * chartH }

const linePath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ')
const areaPath = `${linePath} L${x(DATA.length - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`

const yTicks = [0, 10000, 20000, 30000, 40000]

export default function SalesChart() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Monthly Sales Overview
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4B5563' }}>Jan – Dec 2024</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          +18% vs last year
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#724B68" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#724B68" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)}
              stroke="#E7E9ED" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end"
              fontSize="10" fill="#9ca3af">
              {v === 0 ? '0' : `₹${v / 1000}k`}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#724B68" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {DATA.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.value)} r="4" fill="#fff" stroke="#724B68" strokeWidth="2" />
            <text x={x(i)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {d.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
