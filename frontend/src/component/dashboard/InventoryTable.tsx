const ITEMS = [
  { name: 'Cement Bags',    category: 'Cement',   qty: 120, status: 'In Stock'  },
  { name: 'Steel Rods',     category: 'Steel',    qty: 10,  status: 'Low Stock' },
  { name: 'PVC Pipes',      category: 'Pipes',    qty: 40,  status: 'In Stock'  },
  { name: 'River Sand',     category: 'Aggregate',qty: 8,   status: 'Low Stock' },
  { name: 'Red Bricks',     category: 'Masonry',  qty: 1500,status: 'In Stock'  },
  { name: 'Plywood Sheets', category: 'Timber',   qty: 22,  status: 'Low Stock' },
]

function Badge({ status }: { status: string }) {
  const low = status === 'Low Stock'
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: low ? '#fee2e2' : '#dcfce7',
      color: low ? '#dc2626' : '#16a34a',
    }}>{status}</span>
  )
}

export default function InventoryTable() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
          Inventory Overview
        </h3>
        <span style={{ fontSize: 12, color: '#724B68', fontWeight: 600, cursor: 'pointer' }}>View All →</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['Product Name', 'Category', 'Stock Qty', 'Status'].map(h => (
                <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item, i) => (
              <tr key={item.name} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fff')}
              >
                <td style={{ padding: '13px 24px', fontWeight: 600, color: '#1F2933' }}>{item.name}</td>
                <td style={{ padding: '13px 24px', color: '#4B5563' }}>
                  <span style={{ background: '#F5F6F8', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>{item.category}</span>
                </td>
                <td style={{ padding: '13px 24px', color: item.qty < 20 ? '#dc2626' : '#1F2933', fontWeight: item.qty < 20 ? 700 : 400 }}>
                  {item.qty}
                </td>
                <td style={{ padding: '13px 24px' }}><Badge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
