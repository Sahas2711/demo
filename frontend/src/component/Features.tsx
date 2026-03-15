import { Receipt, Package, Users, BarChart2, FileText, Bell } from 'lucide-react'

const features = [
  { icon: Receipt, title: 'GST Billing', desc: 'Create GST-compliant invoices with auto CGST, SGST & IGST calculation in seconds.' },
  { icon: Package, title: 'Inventory Tracking', desc: 'Monitor stock levels in real time with low-stock alerts and category management.' },
  { icon: Users, title: 'Customer Management', desc: 'Manage customer records, GSTIN validation, and full purchase history.' },
  { icon: BarChart2, title: 'Sales Reports', desc: 'View detailed daily, weekly, and monthly sales reports with revenue trends.' },
  { icon: FileText, title: 'Recent Invoices', desc: 'Track latest transactions, export PDF invoices, and manage billing history.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Get notified for low stock, pending payments, and important business events.' },
]

export default function Features() {
  return (
    <section id="features" style={{ background: '#F5F6F8', padding: '90px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(114,75,104,0.1)', borderRadius: 20, padding: '6px 14px',
            marginBottom: 16, fontSize: 13, color: '#724B68', fontWeight: 600
          }}>⚡ Features</div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, color: '#1F2933',
            margin: '0 0 16px', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px'
          }}>Powerful Features for Retailers</h2>
          <p style={{ fontSize: 17, color: '#4B5563', maxWidth: 520, margin: '0 auto' }}>
            Everything you need to run your building material business efficiently.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              background: '#fff', borderRadius: 16, padding: '28px 28px',
              border: '1px solid #E7E9ED',
              boxShadow: '0 2px 12px rgba(114,75,104,0.07)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 12px 32px rgba(114,75,104,0.15)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 12px rgba(114,75,104,0.07)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(114,75,104,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18
              }}>
                <Icon size={24} color="#724B68" />
              </div>
              <h3 style={{
                fontSize: 18, fontWeight: 700, color: '#1F2933',
                margin: '0 0 10px', fontFamily: 'Poppins, Inter, sans-serif'
              }}>{title}</h3>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
