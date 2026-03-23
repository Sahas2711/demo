import { useState } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff, LogOut, ShieldCheck, Camera, Save, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../component/dashboard/DashboardLayout'

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10,
    border: `1.5px solid ${focused ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused ? '#fdf9fc' : '#F5F6F8',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box' as const, fontFamily: 'Poppins, Inter, sans-serif',
  }
}

function Field({
  label, icon: Icon, type = 'text', value, onChange, placeholder, focused, onFocus, onBlur, right,
}: {
  label: string
  icon: React.ElementType
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  focused: boolean
  onFocus: () => void
  onBlur: () => void
  right?: React.ReactNode
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} color={focused ? '#724B68' : '#9ca3af'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          style={{ ...inputStyle(focused), paddingRight: right ? 44 : 14 }}
        />
        {right && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</div>}
      </div>
    </div>
  )
}

export default function AdminProfilePage() {
  const navigate = useNavigate()

  // Personal info state
  const [name, setName]   = useState('Admin User')
  const [email, setEmail] = useState('admin@inventra.com')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [focusName, setFocusName]   = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPhone, setFocusPhone] = useState(false)
  const [savedInfo, setSavedInfo]   = useState(false)

  // Password state
  const [curPass, setCurPass]     = useState('')
  const [newPass, setNewPass]     = useState('')
  const [confPass, setConfPass]   = useState('')
  const [showCur, setShowCur]     = useState(false)
  const [showNew, setShowNew]     = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [focusCur, setFocusCur]   = useState(false)
  const [focusNew, setFocusNew]   = useState(false)
  const [focusConf, setFocusConf] = useState(false)
  const [passError, setPassError] = useState('')
  const [savedPass, setSavedPass] = useState(false)

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavedInfo(true)
    setTimeout(() => setSavedInfo(false), 2500)
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPass.length < 8) { setPassError('Password must be at least 8 characters.'); return }
    if (newPass !== confPass) { setPassError('Passwords do not match.'); return }
    setPassError('')
    setSavedPass(true)
    setCurPass(''); setNewPass(''); setConfPass('')
    setTimeout(() => setSavedPass(false), 2500)
  }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 18, border: '1px solid #E7E9ED',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '28px 32px',
  }

  return (
    <DashboardLayout>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
          Profile Settings
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
          Manage your personal information and account security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }} className="profile-grid">

        {/* ── Left: Profile Overview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0 }}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#724B68,#9B6F92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 16px rgba(114,75,104,0.3)' }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#724B68', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Change photo"
              >
                <Camera size={13} color="#fff" />
              </button>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', marginBottom: 4 }}>{name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(114,75,104,0.08)', color: '#724B68', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <ShieldCheck size={12} /> Administrator
            </div>
            <div style={{ fontSize: 13, color: '#4B5563' }}>{email}</div>
          </div>

          {/* Logout card */}
          <div style={{ ...card, padding: '18px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', marginBottom: 12 }}>Account Actions</div>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff5f5', fontSize: 14, fontWeight: 600, color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca' }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* ── Right: Forms ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Personal Information */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(114,75,104,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#724B68" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Personal Information</div>
                <div style={{ fontSize: 12, color: '#4B5563' }}>Update your name, email and phone</div>
              </div>
            </div>

            <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Full Name" icon={User} value={name} onChange={setName} placeholder="Your full name"
                focused={focusName} onFocus={() => setFocusName(true)} onBlur={() => setFocusName(false)} />
              <Field label="Email Address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="you@company.com"
                focused={focusEmail} onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} />
              <Field label="Phone Number" icon={Phone} type="tel" value={phone} onChange={setPhone} placeholder="+91 00000 00000"
                focused={focusPhone} onFocus={() => setFocusPhone(true)} onBlur={() => setFocusPhone(false)} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '11px 24px', borderRadius: 10,
                  border: 'none', background: savedInfo ? '#059669' : '#724B68', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(114,75,104,0.25)',
                }}
                  onMouseEnter={e => { if (!savedInfo) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { if (!savedInfo) { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' } }}
                >
                  <Save size={15} /> {savedInfo ? 'Saved ✓' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={18} color="#2563eb" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>Security Settings</div>
                <div style={{ fontSize: 12, color: '#4B5563' }}>Change your account password</div>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Current Password" icon={Lock} type={showCur ? 'text' : 'password'} value={curPass} onChange={setCurPass}
                placeholder="Enter current password" focused={focusCur}
                onFocus={() => setFocusCur(true)} onBlur={() => setFocusCur(false)}
                right={
                  <button type="button" onClick={() => setShowCur(!showCur)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                    {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <Field label="New Password" icon={Lock} type={showNew ? 'text' : 'password'} value={newPass} onChange={setNewPass}
                placeholder="Min. 8 characters" focused={focusNew}
                onFocus={() => setFocusNew(true)} onBlur={() => setFocusNew(false)}
                right={
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <Field label="Confirm Password" icon={Lock} type={showConf ? 'text' : 'password'} value={confPass} onChange={setConfPass}
                placeholder="Re-enter new password" focused={focusConf}
                onFocus={() => setFocusConf(true)} onBlur={() => setFocusConf(false)}
                right={
                  <button type="button" onClick={() => setShowConf(!showConf)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Password strength indicator */}
              {newPass.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(n => {
                      const strength = newPass.length >= 12 ? 4 : newPass.length >= 10 ? 3 : newPass.length >= 8 ? 2 : 1
                      const colors = ['#ef4444', '#f97316', '#eab308', '#059669']
                      return <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= strength ? colors[strength - 1] : '#E7E9ED', transition: 'background 0.3s' }} />
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: '#4B5563' }}>
                    {newPass.length < 8 ? 'Weak' : newPass.length < 10 ? 'Fair' : newPass.length < 12 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}

              {passError && (
                <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
                  {passError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '11px 24px', borderRadius: 10,
                  border: 'none', background: savedPass ? '#059669' : '#2563eb', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                }}
                  onMouseEnter={e => { if (!savedPass) { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { if (!savedPass) { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)' } }}
                >
                  <KeyRound size={15} /> {savedPass ? 'Updated ✓' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
