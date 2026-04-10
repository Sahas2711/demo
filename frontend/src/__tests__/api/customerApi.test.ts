import { describe, expect, it } from 'vitest'
import { customerApi } from '@/api/customerApi'

describe('customerApi', () => {
  it('fetches customers with pagination metadata', async () => {
    const response = await customerApi.getCustomers({ size: 50 })

    expect(response.data.totalElements).toBe(2)
    expect(response.data.content[0].name).toBe('Rahul Traders')
  })

  it('creates and updates a customer', async () => {
    const created = await customerApi.createCustomer({ name: 'New Buyer', phone: '9000000000', creditLimit: 1000 })
    const updated = await customerApi.updateCustomer(created.data.id, { name: 'Updated Buyer', phone: '9000000000' })

    expect(created.status).toBe(201)
    expect(updated.data.name).toBe('Updated Buyer')
  })

  it('rejects invalid customer payloads', async () => {
    await expect(customerApi.createCustomer({ name: '', phone: '' })).rejects.toMatchObject({
      response: { status: 400 },
    })
  })

  it('fetches customer details and purchase history', async () => {
    const customer = await customerApi.getCustomerById('cust-1')
    const history = await customerApi.getPurchaseHistory('cust-1')

    expect(customer.data.gstNumber).toBe('22AAAAA0000A1Z5')
    expect(history.data[0].invoiceNumber).toBe('INV-1021')
  })

  it('deletes a customer and handles missing records', async () => {
    await expect(customerApi.deleteCustomer('cust-1')).resolves.toMatchObject({ data: { message: 'Customer deleted successfully' } })
    await expect(customerApi.getCustomerById('missing')).rejects.toMatchObject({ response: { status: 404 } })
  })
})
