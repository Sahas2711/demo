import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CustomerTable from '@/component/customers/CustomerTable'
import { fixtures, renderWithProviders, screen, within } from '../test-utils'

describe('CustomerTable', () => {
  it('renders customer rows and summary counts', () => {
    renderWithProviders(<CustomerTable customers={fixtures.customers} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Rahul Traders')).toBeInTheDocument()
    expect(screen.getByText('Showing 2 of 2 customers')).toBeInTheDocument()
  })

  it('filters customers by name and GSTIN', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerTable customers={fixtures.customers} onView={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/search by name/i), 'amit')
    expect(screen.getByText('Amit Hardware')).toBeInTheDocument()
    expect(screen.queryByText('Rahul Traders')).not.toBeInTheDocument()
  })

  it('calls view, edit, and delete handlers', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    renderWithProviders(<CustomerTable customers={fixtures.customers} onView={onView} onEdit={onEdit} onDelete={onDelete} />)

    const row = screen.getByText('Rahul Traders').closest('tr')
    expect(row).not.toBeNull()
    const scoped = within(row as HTMLTableRowElement)

    await user.click(scoped.getByRole('button', { name: /view/i }))
    await user.click(scoped.getByRole('button', { name: /edit/i }))
    await user.click(scoped.getAllByRole('button')[2])
    await user.click(scoped.getByRole('button', { name: /yes/i }))

    expect(onView).toHaveBeenCalledWith(fixtures.customers[0])
    expect(onEdit).toHaveBeenCalledWith(fixtures.customers[0])
    expect(onDelete).toHaveBeenCalledWith('cust-1')
  })
})
