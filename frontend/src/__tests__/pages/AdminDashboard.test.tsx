import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import AdminDashboard from '@/pages/AdminDashboard'
import { renderWithProviders, screen } from '../test-utils'

describe('AdminDashboard', () => {
  it('renders the dashboard overview widgets', () => {
    renderWithProviders(<AdminDashboard />, { withAuth: true })

    expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument()
    expect(screen.getByText(/welcome back, admin/i)).toBeInTheDocument()
    expect(screen.getByText(/recent invoices/i)).toBeInTheDocument()
  })

  it('supports dashboard navigation controls', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminDashboard />, { withAuth: true })

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })
})
