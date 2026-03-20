import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, UserCheck, Eye as EyeIcon } from 'lucide-react'
import type { AppUser, Role } from './userData'
import { ROLE_CONFIG } from './userData'

type UserInput = Omit<AppUser, 'id' | 'joinedDate' | 'avatar'> & { id?: string; password?: string }

interface Props {
  user?: AppUser | null
  onSave: (u: UserInput) => void
  onClose: () => void
}

const ROLES: Role[] = ['Admin', 'Staff', 'Viewer']
const ROLE_ICONS = { Admin: ShieldCheck, Staff: UserCheck, Viewer: EyeIcon }
const EMPTY = { name: '', email: '', phone: '', password: '', role: 'Staff' as Role, status: 'Active' as const }

export default function UserModal({ user, onSave, onClose }: Props) {
  const [form, setForm]         = useState(EMPTY)
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)
  const [errors, setErrors]     = useState<Record<string, string>>({})

  useEffect(() => {
    setForm(user ? { name: user.name, email: user.email, phone: user.phone, password: '', role: user.role, status: user.status } : EMPTY)
    setErrors({})
  }, [user])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                              e.name  = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!/^\d{10}$/.test(form.phone))                   e.phone = 'Enter a valid 10-digit number'
    if (!user && !form.password)                        e.password = 'Password is required'
    if (form.password && form.password.length < 6)      e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({ id: user?.id, name: form.name.trim(), email: form.email.trim(), phone: form.phone, role: form.role, status: form.status, password: form.password || undefined })
  }

  const inp = (f: string, hasError: boolean, noIcon = false): React.CSSProperties => ({
    width: '100%', padding: `10px 12px 10px ${noIcon ? 12 : 38}px`, borderRadius: 8, boxSizing: 'border-box',
    border: `1.5px solid ${hasError ? '#ef4444' : focused === f ? '#724B68' : '#E7E9ED'}`,
    fontSize: 14, color: '#1F2933', background: focused === f ? '#fdf9fc' : '#fff',
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'Poppins, Inter, sans-serif',
  })
  const is: React.CSSProperties = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }
  const ic = (f: string) => focused === f ? '#724B68' : '#9ca3af'
  const lbl = (t: string, opt = false) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', display: 'block', marginBottom: 5 }}>
      {t}{opt && <span style={{ color: '#9ca3af', fontWeight: 400 }}> (optional)</span>}
    </label>
  )
  const err = (f: string) => errors[f]
    ? <span style={{ fontSize: 11, color: '#ef4444', marginTop: 3, display: 'block' }}>{errors[f]}</span>
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeInUp 0.25s ease both', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E9ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>
              {user ? 'Edit User' : 'Add User'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4B5563' }}>
              {user ? 'Update user details and role.' : 'Create a new user account.'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F5F6F8', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Role selector */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1F2933', margin: '0 0 10px' }}>Assign Role</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {ROLES.map(r => {
                const { color, bg, desc } = ROLE_CONFIG[r]
                const Icon = ROLE_ICONS[r]
                const sel = form.role === r
                return (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${sel ? color : '#E7E9ED'}`,
                    background: sel ? bg : '#fff', transition: 'all 0.18s', outline: 'none',
                    boxShadow: sel ? `0 2px 12px ${color}22` : 'none',
                  }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = color }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#E7E9ED' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: sel ? color : '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s' }}>
                      <Icon size={16} color={sel ? '#fff' : '#4B5563'} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sel ? color : '#1F2933' }}>{r}</span>
                    <span style={{ fontSize: 10, color: '#4B5563', textAlign: 'center', lineHeight: 1.3 }}>{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {lbl('Full Name')}
              <div style={{ position: 'relative' }}>
                <User size={15} color={ic('name')} style={is} />
                <input type="text" placeholder="Full name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  style={inp('name', !!errors.name)} />
              </div>
              {err('name')}
            </div>
            <div>
              {lbl('Phone Number')}
              <div style={{ position: 'relative' }}>
                <Phone size={15} color={ic('phone')} style={is} />
                <input type="tel" placeholder="10-digit number" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  style={inp('phone', !!errors.phone)} />
              </div>
              {err('phone')}
            </div>
          </div>

          {/* Email */}
          <div>
            {lbl('Email Address')}
            <div style={{ position: 'relative' }}>
              <Mail size={15} color={ic('email')} style={is} />
              <input type="email" placeholder="user@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={inp('email', !!errors.email)} />
            </div>
            {err('email')}
          </div>

          {/* Password */}
          <div>
            {lbl(user ? 'New Password' : 'Password', !!user)}
            <div style={{ position: 'relative' }}>
              <Lock size={15} color={ic('pass')} style={is} />
              <input type={showPass ? 'text' : 'password'} placeholder={user ? 'Leave blank to keep current' : 'Min. 6 characters'} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                style={{ ...inp('pass', !!errors.password), paddingRight: 38 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {err('password')}
          </div>

          {/* Status toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F5F6F8', borderRadius: 10, padding: '12px 14px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>Account Status</div>
              <div style={{ fontSize: 12, color: '#4B5563', marginTop: 2 }}>User can {form.status === 'Active' ? '' : 'not '}log in</div>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' }))} style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: form.status === 'Active' ? '#724B68' : '#E7E9ED',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.status === 'Active' ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid #E7E9ED', background: '#fff', fontSize: 14, fontWeight: 600, color: '#4B5563', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F6F8'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Cancel</button>
            <button onClick={handleSave} style={{
              padding: '10px 26px', borderRadius: 10, border: 'none',
              background: '#724B68', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(114,75,104,0.3)',
              transition: 'all 0.2s', fontFamily: 'Poppins, Inter, sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' }}
            >Save User</button>
          </div>
        </div>
      </div>
    </div>
  )
}
