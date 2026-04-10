import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from '@/component/LoginForm'
import { renderWithProviders, screen, waitFor } from '../test-utils'

const loginMock = vi.fn<(...args: [string, string]) => Promise<void>>()
const navigateMock = vi.fn()

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateMock }
})

describe('LoginForm', () => {
  it('renders fields, role choices, and submit action', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    const password = screen.getByLabelText(/password/i)
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getAllByRole('button')[3])
    expect(password).toHaveAttribute('type', 'text')
  })

  it('submits credentials and redirects based on stored role', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValueOnce()
    localStorage.setItem('user', JSON.stringify({ role: 'STAFF' }))
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email address/i), 'staff@inventra.test')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('staff@inventra.test', 'password123'))
    expect(navigateMock).toHaveBeenCalledWith('/staff', { replace: true })
  })

  it('shows backend login errors', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValueOnce({ response: { status: 401 } })
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email address/i), 'admin@inventra.test')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
  })
})
