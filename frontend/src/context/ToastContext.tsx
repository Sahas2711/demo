import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastType = 'error' | 'success' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
  error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626' },
  success: { bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
  info:    { bg: '#eff6ff', border: '#93c5fd', color: '#2563eb' },
}

let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, color: c.color,
              borderRadius: 10, padding: '12px 16px', fontSize: 13, fontWeight: 500,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: 'Poppins, Inter, sans-serif',
              animation: 'fadeInUp 0.25s ease both',
            }}>
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
