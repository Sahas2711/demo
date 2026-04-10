import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RegisterForm from '@/component/RegisterForm'
import type { RegisterPayload } from '@/context/AuthContext'
import { renderWithProviders, screen, waitFor } from '../test-utils'

const registerMock = vi.fn<(payload: RegisterPayload) => Promise<void>>()
const navigateMock = vi.fn()

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ register: registerMock }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateMock }
})

describe('RegisterForm', () => {
  it('renders disabled submit until terms are accepted', () => {
    renderWithProviders(<RegisterForm />)

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create admin account/i })).toBeDisabled()
  })

  it('shows role-specific fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.click(screen.getByRole('button', { name: /staff/i }))
    expect(screen.getByText(/employment details/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /viewer/i }))
    expect(screen.getByText(/organisation details/i)).toBeInTheDocument()
  })

  it('validates mismatched passwords before calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByPlaceholderText(/john doe/i), 'Admin User')
    await user.type(screen.getByPlaceholderText(/you@company.com/i), 'admin@inventra.test')
    await user.type(screen.getAllByPlaceholderText(/â€¢/i)[0], 'password123')
    await user.type(screen.getAllByPlaceholderText(/â€¢/i)[1], 'different123')
    await user.click(screen.getByText(/i agree to the/i))
    await user.click(screen.getByRole('button', { name: /create admin account/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('registers and redirects when valid', async () => {
    const user = userEvent.setup()
    registerMock.mockResolvedValueOnce()
    localStorage.setItem('user', JSON.stringify({ role: 'VIEWER' }))
    renderWithProviders(<RegisterForm />)

    await user.click(screen.getByRole('button', { name: /viewer/i }))
    await user.type(screen.getByPlaceholderText(/john doe/i), 'Viewer User')
    await user.type(screen.getByPlaceholderText(/you@company.com/i), 'viewer@inventra.test')
    await user.type(screen.getAllByPlaceholderText(/â€¢/i)[0], 'password123')
    await user.type(screen.getAllByPlaceholderText(/â€¢/i)[1], 'password123')
    await user.click(screen.getByText(/i agree to the/i))
    await user.click(screen.getByRole('button', { name: /create viewer account/i }))

    await waitFor(() => expect(registerMock).toHaveBeenCalledWith({
      name: 'Viewer User',
      email: 'viewer@inventra.test',
      password: 'password123',
      role: 'VIEWER',
    }))
    expect(navigateMock).toHaveBeenCalledWith('/viewer', { replace: true })
  })
})
