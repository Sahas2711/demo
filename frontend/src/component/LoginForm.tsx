import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Package, ShieldCheck, UserCheck, Eye as EyeIcon, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN:  '/dashboard',
  STAFF:  '/staff',
  VIEWER: '/viewer',
}

const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Full access',
    icon: ShieldCheck,
    color: '#724B68',
    bg: 'rgba(114,75,104,0.08)',
  },
  {
    id: 'staff',
    label: 'Staff',
    desc: 'Billing & inventory',
    icon: UserCheck,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.08)',
  },
  {
    id: 'viewer',
    label: 'Viewer',
    desc: 'Reports only',
    icon: EyeIcon,
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
  },
]

export default function LoginForm() {
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [role, setRole] = useState('admin')
  const [emailFocus, setEmailFocus] = useState(false)
  const [passFocus, setPassFocus] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      console.log(email);
      console.log(password);
      await login(email, password)

      // After login, the user object is in context — redirect based on actual role from backend
      const stored = localStorage.getItem('user')
      if (stored) {
        const user = JSON.parse(stored)
        const target = ROLE_REDIRECT[user.role] || '/dashboard'
        navigate(target, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 401 ? 'Invalid email or password' :
         err?.response?.status === 423 ? 'Account is locked. Please try again later.' :
         err?.response?.status === 403 ? 'Account is disabled' :
         'Login failed. Please try again.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: 8,
    border: `1.5px solid ${focused ? '#724B68' : '#E7E9ED'}`,
    fontSize: 15,
    color: '#1F2933',
    background: focused ? '#fdf9fc' : '#fff',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'Poppins, Inter, sans-serif',
  })

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', background: '#F5F6F8', minHeight: '100svh'
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '44px 40px',
        boxShadow: '0 8px 40px rgba(114,75,104,0.12)',
        border: '1px solid #E7E9ED',
        width: '100%', maxWidth: 440,
        animation: 'fadeInUp 0.5s ease both'
      }}>

        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }} className="mobile-logo">
          <div style={{
            background: '#724B68', borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Package size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
            Inventra
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#1F2933',
            margin: '0 0 8px', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px'
          }}>Welcome Back</h2>
          <p style={{ fontSize: 15, color: '#4B5563', margin: 0 }}>
            Sign in to continue to your dashboard.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            animation: 'fadeInUp 0.3s ease both',
          }}>
            <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Role selector — informational only, backend determines actual role */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1F2933', margin: '0 0 10px' }}>
            Sign in as
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {ROLES.map(({ id, label, desc, icon: Icon, color, bg }) => {
              const selected = role === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${selected ? color : '#E7E9ED'}`,
                    background: selected ? bg : '#fff',
                    transition: 'all 0.18s', outline: 'none',
                    boxShadow: selected ? `0 2px 12px ${color}22` : 'none'
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = color }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#E7E9ED' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: selected ? color : '#F5F6F8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.18s'
                  }}>
                    <Icon size={18} color={selected ? '#fff' : '#4B5563'} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: selected ? color : '#1F2933' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 11, color: '#4B5563', textAlign: 'center', lineHeight: 1.3 }}>
                    {desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color={emailFocus ? '#724B68' : '#9ca3af'} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              <input
                type="email" required placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)}
                style={inputStyle(emailFocus)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>Password</label>
              <a href="#forgot" style={{ fontSize: 13, color: '#724B68', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = '#5A3A52'}
                onMouseLeave={e => e.currentTarget.style.color = '#724B68'}
              >Forgot Password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color={passFocus ? '#724B68' : '#9ca3af'} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              <input
                type={showPass ? 'text' : 'password'} required placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)} onBlur={() => setPassFocus(false)}
                style={{ ...inputStyle(passFocus), paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: '#9ca3af', display: 'flex', alignItems: 'center'
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}
              />
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                border: `2px solid ${remember ? '#724B68' : '#E7E9ED'}`,
                background: remember ? '#724B68' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', pointerEvents: 'none'
              }}>
                {remember && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span style={{ fontSize: 14, color: '#4B5563', fontWeight: 500 }}>Remember Me</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            background: loading ? '#9B6F92' : '#724B68',
            color: '#fff', padding: '14px', borderRadius: 10,
            fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(114,75,104,0.3)',
            transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(114,75,104,0.35)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? '#9B6F92' : '#724B68'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(114,75,104,0.3)' }}
          >
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Create account */}
        <p style={{ textAlign: 'center', fontSize: 14, color: '#4B5563', margin: '24px 0 0' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#724B68', fontWeight: 700, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#5A3A52'}
            onMouseLeave={e => e.currentTarget.style.color = '#724B68'}
          >Create Account</Link>
        </p>
      </div>
    </div>
  )
}
