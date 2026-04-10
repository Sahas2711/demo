import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LoginPage from '@/pages/LoginPage'
import { renderWithProviders, screen, waitFor } from '../test-utils'

describe('LoginPage', () => {
  it('renders the login experience', () => {
    renderWithProviders(<LoginPage />, { withAuth: true })

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument()
  })

  it('logs in through the real AuthProvider and stores the session', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { withAuth: true })

    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled())
    await user.type(screen.getByLabelText(/email address/i), 'admin@inventra.test')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(localStorage.getItem('refreshToken')).toBe('refresh-token'))
  })
})
