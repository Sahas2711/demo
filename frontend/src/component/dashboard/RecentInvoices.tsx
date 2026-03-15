const INVOICES = [
  { id: 'INV-1021', customer: 'Rahul Traders',   amount: '₹3,200', date: '24 May 2024', status: 'Paid'    },
  { id: 'INV-1022', customer: 'Amit Hardware',   amount: '₹1,800', date: '24 May 2024', status: 'Pending' },
  { id: 'INV-1023', customer: 'Ravi Constructions', amount: '₹8,500', date: '23 May 2024', status: 'Paid' },
  { id: 'INV-1024', customer: 'Sharma Builders', amount: '₹4,200', date: '23 May 2024', status: 'Pending' },
  { id: 'INV-1025', customer: 'Kumar & Sons',    amount: '₹12,000',date: '22 May 2024', status: 'Paid'    },
]

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'Paid'
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: paid ? '#dcfce7' : '#fef9c3',
      color: paid ? '#16a34a' : '#ca8a04',
    }}>{status}</span>
  )
}

export default function RecentInvoices() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E9ED', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
          Recent Invoices
        </h3>
        <span style={{ fontSize: 12, color: '#724B68', fontWeight: 600, cursor: 'pointer' }}>View All →</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8' }}>
              {['Invoice ID', 'Customer', 'Amount', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '11px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map(inv => (
              <tr key={inv.id} style={{ borderTop: '1px solid #F5F6F8', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf9fc')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '13px 24px', fontWeight: 700, color: '#724B68' }}>{inv.id}</td>
                <td style={{ padding: '13px 24px', color: '#1F2933', fontWeight: 500 }}>{inv.customer}</td>
                <td style={{ padding: '13px 24px', fontWeight: 700, color: '#1F2933' }}>{inv.amount}</td>
                <td style={{ padding: '13px 24px', color: '#4B5563', fontSize: 13 }}>{inv.date}</td>
                <td style={{ padding: '13px 24px' }}><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
