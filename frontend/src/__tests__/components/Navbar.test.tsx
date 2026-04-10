import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Navbar from '@/component/Navbar'
import { renderWithProviders, screen } from '../test-utils'

describe('Navbar', () => {
  it('renders brand and desktop navigation links', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByText('Inventra')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /features/i })).toHaveAttribute('href', '#features')
    expect(screen.getByRole('link', { name: /pricing/i })).toHaveAttribute('href', '#pricing')
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/login')
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    const toggle = screen.getByRole('button')
    await user.click(toggle)
    expect(screen.getAllByRole('link', { name: /features/i })).toHaveLength(2)

    await user.click(screen.getAllByRole('link', { name: /features/i })[1])
    expect(screen.getAllByRole('link', { name: /features/i })).toHaveLength(1)
  })
})
