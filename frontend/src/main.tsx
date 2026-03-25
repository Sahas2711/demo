import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme before first render
;(function () {
  const saved = localStorage.getItem('theme') || 'light'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved === 'dark' || (saved === 'system' && prefersDark)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
