import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Package,
  ShieldCheck, UserCheck, Eye as EyeIcon,
  Building2, MapPin, FileText, Users,
  BadgeCheck, Store, Settings2, Briefcase, LayoutDashboard,
} from 'lucide-react'

const ROLES = [
  { id: 'admin',  label: 'Admin',  desc: 'Shop owner',          icon: ShieldCheck, color: '#724B68', bg: 'rgba(114,75,104,0.08)' },
  { id: 'staff',  label: 'Staff',  desc: 'Billing operator',    icon: UserCheck,   color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
  { id: 'viewer', label: 'Viewer', desc: 'Accountant / auditor', icon: EyeIcon,     color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
]

const PERMISSIONS = ['Create Invoices', 'Manage Customers', 'View Reports', 'Manage Inventory']

export default function RegisterForm() {
  const [role, setRole]         = useState('admin')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [agreed, setAgreed]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)
  const [perms, setPerms]       = useState<string[]>(['Create Invoices', 'Manage Customers'])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  function togglePerm(p: string) {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const inp = (field: string, noIcon = false): React.CSSProperties => ({
    width: '100%',
    padding: `11px 14px 11px ${noIcon ? 14 : 40}px`,
    borderRadius: 8,
    border: `1.5px solid ${focused === field ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933',
    background: focused === field ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box', fontFamily: 'Poppins, Inter, sans-serif',
  })

  const ic = (f: string) => focused === f ? '#724B68' : '#9ca3af'
  const is: React.CSSProperties = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }

  const lbl = (text: string, optional = false) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>
      {text}{optional && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (optional)</span>}
    </label>
  )

  const activeRole = ROLES.find(r => r.id === role)!

  // Role-specific badge shown below role selector
  const roleBadgeText: Record<string, string> = {
    admin:  '🛡️ Admin can manage products, inventory, reports, and users.',
    staff:  '🧾 Staff can create invoices and manage customers.',
    viewer: '👁️ Viewer has read-only access to reports and analytics.',
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#F5F6F8', minHeight: '100svh', overflowY: 'auto' }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '36px 36px',
        boxShadow: '0 8px 40px rgba(114,75,104,0.12)', border: '1px solid #E7E9ED',
        width: '100%', maxWidth: 500, animation: 'fadeInUp 0.5s ease both',
      }}>

        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }} className="mobile-logo">
          <div style={{ background: '#724B68', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Inventra</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1F2933', margin: '0 0 6px', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: 14, color: '#4B5563', margin: 0 }}>Sign up to start using Inventra.</p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2933', margin: '0 0 10px' }}>Select Your Role</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {ROLES.map(({ id, label, desc, icon: Icon, color, bg }) => {
              const sel = role === id
              return (
                <button key={id} type="button" onClick={() => setRole(id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${sel ? color : '#E7E9ED'}`,
                  background: sel ? bg : '#fff', transition: 'all 0.2s', outline: 'none',
                  boxShadow: sel ? `0 2px 12px ${color}22` : 'none',
                }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = color }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#E7E9ED' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: sel ? color : '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <Icon size={17} color={sel ? '#fff' : '#4B5563'} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sel ? color : '#1F2933' }}>{label}</span>
                  <span style={{ fontSize: 10, color: '#4B5563', textAlign: 'center', lineHeight: 1.3 }}>{desc}</span>
                </button>
              )
            })}
          </div>

          {/* Role description badge */}
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: `${activeRole.bg}`, border: `1px solid ${activeRole.color}22`,
            fontSize: 12, color: activeRole.color, fontWeight: 500,
            transition: 'all 0.2s',
          }}>
            {roleBadgeText[role]}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Common fields ── */}
          <div style={{ borderTop: '1px solid #E7E9ED', paddingTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Information</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {lbl('Full Name')}
                  <div style={{ position: 'relative' }}>
                    <User size={15} color={ic('name')} style={is} />
                    <input type="text" required placeholder="John Doe"
                      onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                      style={inp('name')} />
                  </div>
                </div>
                <div>
                  {lbl('Phone Number')}
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color={ic('phone')} style={is} />
                    <input type="tel" required placeholder="+91 98765 43210"
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                      style={inp('phone')} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                {lbl('Email Address')}
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color={ic('email')} style={is} />
                  <input type="email" required placeholder="you@company.com"
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    style={inp('email')} />
                </div>
              </div>

              {/* Password + Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {lbl('Password')}
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color={ic('pass')} style={is} />
                    <input type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                      onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                      style={{ ...inp('pass'), paddingRight: 36 }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  {lbl('Confirm Password')}
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color={ic('conf')} style={is} />
                    <input type={showConf ? 'text' : 'password'} required placeholder="••••••••"
                      onFocus={() => setFocused('conf')} onBlur={() => setFocused(null)}
                      style={{ ...inp('conf'), paddingRight: 36 }} />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex' }}>
                      {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ADMIN fields ── */}
          {role === 'admin' && (
            <div style={{ borderTop: '1px solid #E7E9ED', paddingTop: 16, animation: 'fadeInUp 0.3s ease both' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#724B68', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={13} /> Business Information
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    {lbl('Business / Shop Name')}
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} color={ic('shopname')} style={is} />
                      <input type="text" required placeholder="Sharma Traders"
                        onFocus={() => setFocused('shopname')} onBlur={() => setFocused(null)}
                        style={inp('shopname')} />
                    </div>
                  </div>
                  <div>
                    {lbl('GST Number', true)}
                    <div style={{ position: 'relative' }}>
                      <FileText size={15} color={ic('gst')} style={is} />
                      <input type="text" placeholder="22AAAAA0000A1Z5"
                        onFocus={() => setFocused('gst')} onBlur={() => setFocused(null)}
                        style={inp('gst')} />
                    </div>
                  </div>
                </div>
                <div>
                  {lbl('Shop Address')}
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} color={ic('addr')} style={is} />
                    <input type="text" required placeholder="123, MG Road, Bengaluru"
                      onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)}
                      style={inp('addr')} />
                  </div>
                </div>
                <div>
                  {lbl('Number of Employees')}
                  <div style={{ position: 'relative' }}>
                    <Users size={15} color={ic('emp')} style={is} />
                    <input type="number" required placeholder="e.g. 5" min={1}
                      onFocus={() => setFocused('emp')} onBlur={() => setFocused(null)}
                      style={inp('emp')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STAFF fields ── */}
          {role === 'staff' && (
            <div style={{ borderTop: '1px solid #E7E9ED', paddingTop: 16, animation: 'fadeInUp 0.3s ease both' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserCheck size={13} /> Employment Details
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    {lbl('Employee ID')}
                    <div style={{ position: 'relative' }}>
                      <BadgeCheck size={15} color={ic('empid')} style={is} />
                      <input type="text" required placeholder="EMP-001"
                        onFocus={() => setFocused('empid')} onBlur={() => setFocused(null)}
                        style={inp('empid')} />
                    </div>
                  </div>
                  <div>
                    {lbl('Assigned Shop')}
                    <div style={{ position: 'relative' }}>
                      <Store size={15} color={ic('shop')} style={is} />
                      <input type="text" required placeholder="Main Branch"
                        onFocus={() => setFocused('shop')} onBlur={() => setFocused(null)}
                        style={inp('shop')} />
                    </div>
                  </div>
                </div>

                {/* Role permissions */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 8 }}>
                    <Settings2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Role Permissions
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PERMISSIONS.map(p => {
                      const checked = perms.includes(p)
                      return (
                        <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${checked ? '#2563eb' : '#E7E9ED'}`, background: checked ? 'rgba(37,99,235,0.05)' : '#fff', transition: 'all 0.15s' }}>
                          <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
                            <input type="checkbox" checked={checked} onChange={() => togglePerm(p)}
                              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#2563eb' : '#E7E9ED'}`, background: checked ? '#2563eb' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', pointerEvents: 'none' }}>
                              {checked && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </div>
                          <span style={{ fontSize: 12, color: checked ? '#2563eb' : '#4B5563', fontWeight: checked ? 600 : 400 }}>{p}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEWER fields ── */}
          {role === 'viewer' && (
            <div style={{ borderTop: '1px solid #E7E9ED', paddingTop: 16, animation: 'fadeInUp 0.3s ease both' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LayoutDashboard size={13} /> Organisation Details
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {lbl('Company Name')}
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={15} color={ic('company')} style={is} />
                    <input type="text" required placeholder="Acme Corp"
                      onFocus={() => setFocused('company')} onBlur={() => setFocused(null)}
                      style={inp('company')} />
                  </div>
                </div>
                <div>
                  {lbl('Department')}
                  <div style={{ position: 'relative' }}>
                    <LayoutDashboard size={15} color={ic('dept')} style={is} />
                    <input type="text" required placeholder="Accounts / Audit"
                      onFocus={() => setFocused('dept')} onBlur={() => setFocused(null)}
                      style={inp('dept')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${agreed ? '#724B68' : '#E7E9ED'}`, background: agreed ? '#724B68' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', pointerEvents: 'none' }}>
                {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <span style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              I agree to the{' '}
              <a href="#terms" style={{ color: '#724B68', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#privacy" style={{ color: '#724B68', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading || !agreed} style={{
            background: !agreed ? '#E7E9ED' : loading ? '#9B6F92' : '#724B68',
            color: !agreed ? '#9ca3af' : '#fff', padding: '13px', borderRadius: 10,
            fontSize: 15, fontWeight: 700, border: 'none',
            cursor: !agreed || loading ? 'not-allowed' : 'pointer',
            boxShadow: agreed ? '0 4px 16px rgba(114,75,104,0.3)' : 'none',
            transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
            onMouseEnter={e => { if (agreed && !loading) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = !agreed ? '#E7E9ED' : loading ? '#9B6F92' : '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading
              ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg> Creating account...</>
              : `Create ${activeRole.label} Account`
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#4B5563', margin: '20px 0 0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#724B68', fontWeight: 700, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#5A3A52'}
            onMouseLeave={e => e.currentTarget.style.color = '#724B68'}
          >Login</Link>
        </p>
      </div>
    </div>
  )
}
