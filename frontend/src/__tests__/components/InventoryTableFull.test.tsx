import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import InventoryTableFull from '@/component/inventory/InventoryTableFull'
import { fixtures, renderWithProviders, screen, within } from '../test-utils'

describe('InventoryTableFull', () => {
  it('renders active products and stock states', () => {
    renderWithProviders(<InventoryTableFull products={fixtures.products} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Ultra Cement')).toBeInTheDocument()
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('filters by product search and category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryTableFull products={fixtures.products} onEdit={vi.fn()} onDelete={vi.fn()} />)

    await user.type(screen.getByPlaceholderText(/search product/i), 'steel')
    expect(screen.getByText('Steel Rod')).toBeInTheDocument()
    expect(screen.queryByText('Ultra Cement')).not.toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/search product/i))
    await user.selectOptions(screen.getByRole('combobox'), 'Building Materials')
    expect(screen.getByText('Ultra Cement')).toBeInTheDocument()
    expect(screen.queryByText('Steel Rod')).not.toBeInTheDocument()
  })

  it('supports editing, stock adjustment, and delete confirmation', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onStockAdjust = vi.fn()
    renderWithProviders(<InventoryTableFull products={fixtures.products} onEdit={onEdit} onDelete={onDelete} onStockAdjust={onStockAdjust} />)

    const row = screen.getByText('Ultra Cement').closest('tr')
    expect(row).not.toBeNull()
    const scoped = within(row as HTMLTableRowElement)

    await user.click(scoped.getByRole('button', { name: /edit/i }))
    await user.click(scoped.getByRole('button', { name: /adjust stock for ultra cement/i }))
    await user.clear(scoped.getByLabelText(/stock quantity/i))
    await user.type(scoped.getByLabelText(/stock quantity/i), '18')
    await user.click(scoped.getByRole('button', { name: /save/i }))
    await user.click(scoped.getByRole('button', { name: /delete/i }))
    await user.click(scoped.getByRole('button', { name: /yes/i }))

    expect(onEdit).toHaveBeenCalledWith(fixtures.product)
    expect(onStockAdjust).toHaveBeenCalledWith('prod-1', 18, 10)
    expect(onDelete).toHaveBeenCalledWith('prod-1')
  })
})
