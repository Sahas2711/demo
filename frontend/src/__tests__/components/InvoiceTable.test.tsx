import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import InvoiceTable, { INITIAL } from '@/component/billing/InvoiceTable'
import { renderWithProviders, screen, within } from '../test-utils'

describe('InvoiceTable', () => {
  it('renders invoices and status badges', () => {
    renderWithProviders(<InvoiceTable invoices={INITIAL} onView={vi.fn()} />)

    expect(screen.getByText('INV-1021')).toBeInTheDocument()
    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0)
    expect(screen.getByText(`Showing ${INITIAL.length} of ${INITIAL.length} invoices`)).toBeInTheDocument()
  })

  it('filters invoices by customer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InvoiceTable invoices={INITIAL} onView={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/search by id or customer/i), 'Amit')

    expect(screen.getByText('Amit Hardware')).toBeInTheDocument()
    expect(screen.queryByText('Rahul Traders')).not.toBeInTheDocument()
  })

  it('opens invoice details through the view action', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderWithProviders(<InvoiceTable invoices={INITIAL} onView={onView} />)

    const row = screen.getByText('INV-1021').closest('tr')
    expect(row).not.toBeNull()
    await user.click(within(row as HTMLTableRowElement).getByRole('button', { name: /view/i }))

    expect(onView).toHaveBeenCalledWith(INITIAL[0])
  })
})
