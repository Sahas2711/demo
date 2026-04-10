import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import BillingPage from '@/pages/BillingPage'
import { renderWithProviders, screen } from '../test-utils'

describe('BillingPage', () => {
  it('loads invoice metrics and table rows from the API', async () => {
    renderWithProviders(<BillingPage />)

    expect(await screen.findByRole('heading', { name: /billing overview/i })).toBeInTheDocument()
    expect(await screen.findByText('INV-1021')).toBeInTheDocument()
    expect(screen.getByText('Rahul Traders')).toBeInTheDocument()
    expect(screen.getByText(/gst summary/i)).toBeInTheDocument()
  })

  it('filters invoices as a user searches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BillingPage />)

    await screen.findByText('INV-1021')
    await user.type(screen.getByPlaceholderText(/search by id or customer/i), 'Amit')

    expect(screen.getByText('Amit Hardware')).toBeInTheDocument()
    expect(screen.queryByText('Rahul Traders')).not.toBeInTheDocument()
  })
})
