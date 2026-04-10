import { http, HttpResponse } from 'msw'
import type {
  CategoryResponse,
  CustomerResponse,
  InvoiceResponse,
  Page,
  ProductResponse,
  TokenResponse,
} from '@/api/types'

const API_URL = 'http://localhost:8080'

export const authSuccess: TokenResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@inventra.test',
    role: 'ADMIN',
  },
}

export const categories: CategoryResponse[] = [
  {
    id: 'cat-1',
    name: 'Building Materials',
    description: 'Core materials',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Hardware',
    description: 'Tools and fittings',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
]

export const products: ProductResponse[] = [
  {
    id: 'prod-1',
    name: 'Ultra Cement',
    description: 'Premium cement bags',
    hsnCode: '2523',
    unitPrice: 350,
    gstPercentage: 18,
    quantityAvailable: 5,
    reorderLevel: 10,
    lowStock: true,
    active: true,
    category: categories[0],
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Steel Rod',
    description: 'TMT rods',
    hsnCode: '7214',
    unitPrice: 620,
    gstPercentage: 18,
    quantityAvailable: 25,
    reorderLevel: 8,
    lowStock: false,
    active: true,
    category: categories[1],
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
]

export const customers: CustomerResponse[] = [
  {
    id: 'cust-1',
    name: 'Rahul Traders',
    phone: '9876543210',
    email: 'rahul@example.com',
    address: '12 MG Road, Bengaluru',
    gstNumber: '22AAAAA0000A1Z5',
    creditLimit: 50000,
    active: true,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Amit Hardware',
    phone: '9123456780',
    address: '45 Ring Road, Pune',
    creditLimit: 25000,
    active: true,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
  },
]

export const invoices: InvoiceResponse[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-1021',
    customerId: 'cust-1',
    customerName: 'Rahul Traders',
    createdBy: 'Admin User',
    status: 'PAID',
    totalAmount: 1000,
    cgst: 90,
    sgst: 90,
    igst: 0,
    grandTotal: 1180,
    notes: 'Paid invoice',
    dueDate: '2026-04-30',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Ultra Cement',
        quantity: 2,
        unitPrice: 500,
        gstPercentage: 18,
        totalPrice: 1000,
      },
    ],
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-1022',
    customerId: 'cust-2',
    customerName: 'Amit Hardware',
    createdBy: 'Admin User',
    status: 'SENT',
    totalAmount: 2000,
    cgst: 180,
    sgst: 180,
    igst: 0,
    grandTotal: 2360,
    items: [],
    createdAt: '2026-04-02T00:00:00Z',
  },
]

function page<T>(content: T[]): Page<T> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: content.length,
    number: 0,
    first: true,
    last: true,
  }
}

export const handlers = [
  http.post(`${API_URL}/v1/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    if (body.email === 'locked@inventra.test') {
      return HttpResponse.json({ message: 'Account is locked' }, { status: 423 })
    }
    if (!body.email || !body.password || body.password === 'wrong-password') {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }
    return HttpResponse.json(authSuccess)
  }),
  http.post(`${API_URL}/v1/auth/register`, async ({ request }) => {
    const body = await request.json() as { email?: string; name?: string; password?: string; role?: string }
    if (body.email === 'existing@inventra.test') {
      return HttpResponse.json({ message: 'An account with this email already exists' }, { status: 409 })
    }
    return HttpResponse.json({ ...authSuccess, user: { ...authSuccess.user, name: body.name ?? authSuccess.user.name, email: body.email ?? authSuccess.user.email, role: body.role ?? 'ADMIN' } })
  }),
  http.post(`${API_URL}/v1/auth/refresh`, () => HttpResponse.json(authSuccess)),
  http.post(`${API_URL}/v1/auth/logout`, () => HttpResponse.json({ message: 'Logged out successfully' })),

  http.get(`${API_URL}/v1/customers`, () => HttpResponse.json(page(customers))),
  http.get(`${API_URL}/v1/customers/:id`, ({ params }) => {
    const customer = customers.find((item) => item.id === params.id)
    return customer ? HttpResponse.json(customer) : HttpResponse.json({ message: 'Customer not found' }, { status: 404 })
  }),
  http.post(`${API_URL}/v1/customers`, async ({ request }) => {
    const body = await request.json() as Partial<CustomerResponse>
    if (!body.name || !body.phone) {
      return HttpResponse.json({ message: 'Name and phone are required' }, { status: 400 })
    }
    return HttpResponse.json({ ...customers[0], ...body, id: 'cust-3', active: true, creditLimit: body.creditLimit ?? 0 }, { status: 201 })
  }),
  http.put(`${API_URL}/v1/customers/:id`, async ({ params, request }) => {
    const body = await request.json() as Partial<CustomerResponse>
    return HttpResponse.json({ ...customers[0], ...body, id: String(params.id) })
  }),
  http.delete(`${API_URL}/v1/customers/:id`, () => HttpResponse.json({ message: 'Customer deleted successfully' })),
  http.get(`${API_URL}/v1/customers/:id/purchase-history`, ({ params }) => HttpResponse.json([
    {
      invoiceId: 'inv-1',
      invoiceNumber: 'INV-1021',
      invoiceDate: '2026-04-01T00:00:00Z',
      totalAmount: 1000,
      gstAmount: 180,
      grandTotal: 1180,
      status: String(params.id) === 'cust-1' ? 'PAID' : 'SENT',
    },
  ])),

  http.get(`${API_URL}/v1/invoices`, () => HttpResponse.json(page(invoices))),
  http.get(`${API_URL}/v1/invoices/:id`, ({ params }) => {
    const invoice = invoices.find((item) => item.id === params.id)
    return invoice ? HttpResponse.json(invoice) : HttpResponse.json({ message: 'Invoice not found' }, { status: 404 })
  }),
  http.post(`${API_URL}/v1/invoices`, async ({ request }) => {
    const body = await request.json() as { customerId?: string; items?: unknown[] }
    if (!body.customerId || !body.items?.length) {
      return HttpResponse.json({ message: 'Customer and at least one item are required' }, { status: 400 })
    }
    return HttpResponse.json({ ...invoices[0], id: 'inv-3', invoiceNumber: 'INV-1023', customerId: body.customerId }, { status: 201 })
  }),
  http.put(`${API_URL}/v1/invoices/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: InvoiceResponse['status'] }
    return HttpResponse.json({ ...invoices[0], id: String(params.id), status: body.status })
  }),

  http.get(`${API_URL}/v1/categories`, () => HttpResponse.json(categories)),
  http.post(`${API_URL}/v1/categories`, async ({ request }) => {
    const body = await request.json() as Partial<CategoryResponse>
    if (!body.name) return HttpResponse.json({ message: 'Category name is required' }, { status: 400 })
    return HttpResponse.json({ ...categories[0], ...body, id: 'cat-3' }, { status: 201 })
  }),
  http.put(`${API_URL}/v1/categories/:id`, async ({ params, request }) => HttpResponse.json({ ...categories[0], ...(await request.json() as Partial<CategoryResponse>), id: String(params.id) })),
  http.delete(`${API_URL}/v1/categories/:id`, () => HttpResponse.json({ message: 'Category deleted successfully' })),

  http.get(`${API_URL}/v1/products`, () => HttpResponse.json(page(products))),
  http.get(`${API_URL}/v1/products/:id`, ({ params }) => {
    const product = products.find((item) => item.id === params.id)
    return product ? HttpResponse.json(product) : HttpResponse.json({ message: 'Product not found' }, { status: 404 })
  }),
  http.post(`${API_URL}/v1/products`, async ({ request }) => {
    const body = await request.json() as Partial<ProductResponse>
    if (!body.name) return HttpResponse.json({ message: 'Product name is required' }, { status: 400 })
    return HttpResponse.json({ ...products[0], ...body, id: 'prod-3', lowStock: false, category: categories[0] }, { status: 201 })
  }),
  http.put(`${API_URL}/v1/products/:id`, async ({ params, request }) => HttpResponse.json({ ...products[0], ...(await request.json() as Partial<ProductResponse>), id: String(params.id) })),
  http.delete(`${API_URL}/v1/products/:id`, () => HttpResponse.json({ message: 'Product deactivated successfully' })),
  http.get(`${API_URL}/v1/inventory`, ({ request }) => {
    const lowStock = new URL(request.url).searchParams.get('lowStock') === 'true'
    return HttpResponse.json(lowStock ? products.filter((product) => product.lowStock) : products)
  }),
  http.get(`${API_URL}/v1/inventory/low-stock`, () => HttpResponse.json(products.filter((product) => product.lowStock))),
  http.put(`${API_URL}/v1/inventory/:id`, async ({ params, request }) => {
    const body = await request.json() as { quantityAvailable: number; reorderLevel?: number }
    const reorderLevel = body.reorderLevel ?? products[0].reorderLevel
    return HttpResponse.json({
      ...products[0],
      id: String(params.id),
      quantityAvailable: body.quantityAvailable,
      reorderLevel,
      lowStock: body.quantityAvailable <= reorderLevel,
    })
  }),
]
