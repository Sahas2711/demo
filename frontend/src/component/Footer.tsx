import { Package } from 'lucide-react'

const cols = [
  { title: 'Product', links: ['Features', 'Pricing'] },
  { title: 'Company', links: ['About', 'Contact'] },
  { title: 'Support', links: ['Help Center', 'FAQs'] },
  { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
]

export default function Footer() {
  return (
    <footer style={{ background: '#2d1f2b', color: '#fff', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)',
          gap: 40, marginBottom: 48
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                background: '#724B68', borderRadius: 10, width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Package size={20} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 20, fontFamily: 'Poppins, Inter, sans-serif' }}>Inventra</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
              Smart billing & inventory management for building material retailers.
            </p>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fff', margin: '0 0 16px' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" style={{
                      color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14,
                      transition: 'color 0.2s'
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#9B6F92')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
            © 2024 Inventra. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
            Built for Building Material Retailers 🏗️
          </p>
        </div>
      </div>
    </footer>
  )
}
