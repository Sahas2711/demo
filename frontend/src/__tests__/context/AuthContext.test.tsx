import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider, getMemoryToken, useAuth } from '@/context/AuthContext'
import { renderWithProviders, screen, waitFor } from '../test-utils'

function AuthConsumer() {
  const { user, loading, isAuthenticated, hasRole, login, logout, refreshSession } = useAuth()
  return (
    <div>
      <p>Loading: {String(loading)}</p>
      <p>User: {user?.email ?? 'none'}</p>
      <p>Authenticated: {String(isAuthenticated)}</p>
      <p>Admin: {String(hasRole('ADMIN'))}</p>
      <button onClick={() => login('admin@inventra.test', 'password123')}>Login</button>
      <button onClick={() => refreshSession()}>Refresh</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderWithProviders(<AuthConsumer />)).toThrow(/useAuth must be used within/i)
    spy.mockRestore()
  })

  it('logs in, exposes role helpers, and logs out', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByText('Loading: false')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText('User: admin@inventra.test')).toBeInTheDocument()
    expect(screen.getByText('Authenticated: true')).toBeInTheDocument()
    expect(screen.getByText('Admin: true')).toBeInTheDocument()
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    expect(getMemoryToken()).toBe('access-token')

    await user.click(screen.getByRole('button', { name: 'Logout' }))
    await waitFor(() => expect(screen.getByText('User: none')).toBeInTheDocument())
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(getMemoryToken()).toBeNull()
  })

  it('hydrates from refresh token and refreshes the session', async () => {
    const user = userEvent.setup()
    localStorage.setItem('refreshToken', 'stored-refresh-token')
    localStorage.setItem('user', JSON.stringify({ id: 'old', name: 'Old', email: 'old@inventra.test', role: 'VIEWER' }))

    renderWithProviders(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(await screen.findByText('User: admin@inventra.test')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => expect(getMemoryToken()).toBe('access-token'))
  })
})
