export default function CTA() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #724B68 0%, #5A3A52 60%, #3d2438 100%)',
      padding: '90px 24px', textAlign: 'center'
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px',
          marginBottom: 24, fontSize: 13, color: '#fff', fontWeight: 600
        }}>🚀 Get Started Today</div>
        <h2 style={{
          fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#fff',
          margin: '0 0 20px', fontFamily: 'Poppins, Inter, sans-serif',
          lineHeight: 1.2, letterSpacing: '-0.5px'
        }}>
          Start Managing Your Business Smarter Today
        </h2>
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', lineHeight: 1.6
        }}>
          Get started with Inventra and streamline your operations.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#get-started" style={{
            background: '#fff', color: '#724B68', padding: '15px 36px',
            borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}
          >Get Started Free</a>
          <a href="#demo" style={{
            background: 'transparent', color: '#fff', padding: '15px 36px',
            borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.5)',
            transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
          >Watch Demo</a>
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          No credit card required · Free 14-day trial · Cancel anytime
        </p>
      </div>
    </section>
  )
}
