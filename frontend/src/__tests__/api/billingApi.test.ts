import { describe, expect, it } from 'vitest'
import { billingApi } from '@/api/billingApi'

describe('billingApi', () => {
  it('fetches a paged invoice list', async () => {
    const response = await billingApi.getInvoices({ page: 0, size: 20, sort: 'createdAt,desc' })

    expect(response.data.content).toHaveLength(2)
    expect(response.data.content[0].invoiceNumber).toBe('INV-1021')
  })

  it('creates an invoice', async () => {
    const response = await billingApi.createInvoice({
      customerId: 'cust-1',
      interState: false,
      items: [{ productId: 'prod-1', quantity: 2, unitPrice: 500 }],
      notes: 'Counter sale',
    })

    expect(response.status).toBe(201)
    expect(response.data.invoiceNumber).toBe('INV-1023')
  })

  it('rejects invoices without items', async () => {
    await expect(billingApi.createInvoice({ customerId: 'cust-1', interState: false, items: [] })).rejects.toMatchObject({
      response: { status: 400 },
    })
  })

  it('gets an invoice by id and handles missing ids', async () => {
    await expect(billingApi.getInvoiceById('inv-1')).resolves.toMatchObject({ data: { customerName: 'Rahul Traders' } })
    await expect(billingApi.getInvoiceById('missing')).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('updates invoice status', async () => {
    const response = await billingApi.updateInvoiceStatus('inv-1', { status: 'CANCELLED' })

    expect(response.data.status).toBe('CANCELLED')
  })
})
