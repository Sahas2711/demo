import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import CustomersPage from '@/pages/CustomersPage'
import { renderWithProviders, screen, waitFor } from '../test-utils'

describe('CustomersPage', () => {
  it('loads customer summary and rows from the API', async () => {
    renderWithProviders(<CustomersPage />)

    expect(await screen.findByRole('heading', { name: /customer management/i })).toBeInTheDocument()
    expect(await screen.findByText('Rahul Traders')).toBeInTheDocument()
    expect(screen.getByText('Showing 2 of 2 customers')).toBeInTheDocument()
  })

  it('adds a customer and refreshes the table', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomersPage />)

    await user.click(await screen.findByRole('button', { name: /add customer/i }))
    await user.type(screen.getByPlaceholderText(/rahul traders/i), 'New Buyer')
    await user.type(screen.getByPlaceholderText(/10-digit mobile number/i), '9000000000')
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    await waitFor(() => expect(screen.queryByRole('heading', { name: /^add customer$/i })).not.toBeInTheDocument())
    expect(await screen.findByText('Rahul Traders')).toBeInTheDocument()
  })

  it('validates customer modal input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomersPage />)

    await user.click(await screen.findByRole('button', { name: /add customer/i }))
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(screen.getByText(/customer name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/valid 10-digit phone/i)).toBeInTheDocument()
  })
})
