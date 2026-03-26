import { useState, useEffect } from 'react'
import {
  Bell, Globe, Shield, Palette, Database,
  Save, ToggleLeft, ToggleRight, Monitor, Moon, Sun,
} from 'lucide-react'
import DashboardLayout from '../component/dashboard/DashboardLayout'

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18, border: '1px solid #E7E9ED',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '28px 32px',
}

function SectionHeader({ icon: Icon, color, title, sub }: { icon: React.ElementType; color: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#4B5563' }}>{sub}</div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
      {on
        ? <ToggleRight size={28} color="#724B68" />
        : <ToggleLeft size={28} color="#9ca3af" />}
    </button>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F5F6F8' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2933' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [invoiceNotif, setInvoiceNotif] = useState(false)
  const [twoFA, setTwoFA] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light'
  )
  const [currency, setCurrency] = useState('INR')
  const [language, setLanguage] = useState('en')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
    root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E7E9ED',
    fontSize: 13, color: '#1F2933', background: '#F5F6F8',
    outline: 'none', fontFamily: 'Poppins, Inter, sans-serif', cursor: 'pointer',
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2933', fontFamily: 'Poppins, Inter, sans-serif', letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4B5563' }}>
          Manage your application preferences and configurations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Notifications */}
        <div style={card} className="dash-card">
          <SectionHeader icon={Bell} color="#724B68" title="Notifications" sub="Control how and when you receive alerts" />
          <Row label="Email Notifications" sub="Receive updates via email">
            <Toggle on={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
          </Row>
          <Row label="Low Stock Alerts" sub="Alert when inventory falls below threshold">
            <Toggle on={lowStockAlert} onToggle={() => setLowStockAlert(!lowStockAlert)} />
          </Row>
          <Row label="Invoice Notifications" sub="Notify on new invoice creation">
            <Toggle on={invoiceNotif} onToggle={() => setInvoiceNotif(!invoiceNotif)} />
          </Row>
        </div>

        {/* Security */}
        <div style={card} className="dash-card">
          <SectionHeader icon={Shield} color="#2563eb" title="Security" sub="Manage account security settings" />
          <Row label="Two-Factor Authentication" sub="Add an extra layer of security">
            <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />
          </Row>
          <Row label="Session Timeout" sub="Auto logout after 30 minutes of inactivity">
            <Toggle on={sessionTimeout} onToggle={() => setSessionTimeout(!sessionTimeout)} />
          </Row>
        </div>

        {/* Appearance */}
        <div style={card} className="dash-card">
          <SectionHeader icon={Palette} color="#f59e0b" title="Appearance" sub="Customize the look of your dashboard" />
          <Row label="Theme">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['light', 'system', 'dark'] as const).map(t => {
                const icons = { light: Sun, system: Monitor, dark: Moon }
                const Icon = icons[t]
                const active = theme === t
                return (
                  <button key={t} onClick={() => setTheme(t)} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                    borderRadius: 8, border: `1.5px solid ${active ? '#724B68' : '#E7E9ED'}`,
                    background: active ? 'rgba(114,75,104,0.08)' : '#F5F6F8',
                    color: active ? '#724B68' : '#4B5563', fontSize: 13, fontWeight: active ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                    fontFamily: 'Poppins, Inter, sans-serif',
                  }}>
                    <Icon size={13} /> {t}
                  </button>
                )
              })}
            </div>
          </Row>
        </div>

        {/* Regional */}
        <div style={card} className="dash-card">
          <SectionHeader icon={Globe} color="#059669" title="Regional" sub="Language and currency preferences" />
          <Row label="Currency">
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={selectStyle}>
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </Row>
          <Row label="Language">
            <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
            </select>
          </Row>
        </div>

        {/* Data */}
        <div style={card} className="dash-card">
          <SectionHeader icon={Database} color="#7c3aed" title="Data & Backup" sub="Manage your data and backup settings" />
          <Row label="Automatic Backup" sub="Daily backup of all data">
            <Toggle on={autoBackup} onToggle={() => setAutoBackup(!autoBackup)} />
          </Row>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '11px 28px', borderRadius: 10,
            border: 'none', background: saved ? '#059669' : '#724B68', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Poppins, Inter, sans-serif', boxShadow: '0 4px 14px rgba(114,75,104,0.25)',
          }}
            onMouseEnter={e => { if (!saved) { e.currentTarget.style.background = '#5A3A52'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { if (!saved) { e.currentTarget.style.background = '#724B68'; e.currentTarget.style.transform = 'translateY(0)' } }}
          >
            <Save size={15} /> {saved ? 'Saved ✓' : 'Save Settings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
