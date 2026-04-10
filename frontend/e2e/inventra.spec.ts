import { expect, test, type Page } from '@playwright/test'

const tokenResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: { id: 'user-1', name: 'Admin User', email: 'admin@inventra.test', role: 'ADMIN' },
}

const customersPage = {
  content: [
    {
      id: 'cust-1',
      name: 'Rahul Traders',
      phone: '9876543210',
      address: '12 MG Road, Bengaluru',
      gstNumber: '22AAAAA0000A1Z5',
      creditLimit: 50000,
      active: true,
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
  first: true,
  last: true,
}

const invoicesPage = {
  content: [
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
      items: [],
      createdAt: '2026-04-01T00:00:00Z',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
  first: true,
  last: true,
}

async function mockApi(page: Page) {
  await page.route('**/v1/auth/login', async (route) => route.fulfill({ json: tokenResponse }))
  await page.route('**/v1/auth/refresh', async (route) => route.fulfill({ json: tokenResponse }))
  await page.route('**/v1/auth/logout', async (route) => route.fulfill({ json: { message: 'Logged out successfully' } }))
  await page.route('**/v1/customers', async (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, json: { ...customersPage.content[0], id: 'cust-2', name: 'New Buyer', phone: '9000000000' } })
    }
    return route.fulfill({ json: customersPage })
  })
  await page.route('**/v1/invoices', async (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, json: { ...invoicesPage.content[0], id: 'inv-2', invoiceNumber: 'INV-1022' } })
    }
    return route.fulfill({ json: invoicesPage })
  })
  await page.route('**/v1/inventory/low-stock', async (route) => route.fulfill({ json: [] }))
  await page.route('**/v1/products**', async (route) => route.fulfill({ json: { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0, first: true, last: true } }))
  await page.route('**/v1/categories', async (route) => route.fulfill({ json: [] }))
}

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email Address').fill('admin@inventra.test')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('login flow', async ({ page }) => {
  await login(page)

  await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible()
  await expect(page.getByText(/admin user/i)).toBeVisible()
})

test('navigation test', async ({ page }) => {
  await login(page)

  await page.getByRole('link', { name: /customers/i }).click()
  await expect(page).toHaveURL(/\/dashboard\/customers/)
  await expect(page.getByRole('heading', { name: /customer management/i })).toBeVisible()

  await page.getByRole('link', { name: /invoices/i }).click()
  await expect(page).toHaveURL(/\/dashboard\/invoices/)
  await expect(page.getByRole('heading', { name: /billing overview/i })).toBeVisible()
})

test('add customer flow', async ({ page }) => {
  await login(page)
  await page.goto('/dashboard/customers')

  await page.getByRole('button', { name: /add customer/i }).click()
  await page.getByPlaceholder(/rahul traders/i).fill('New Buyer')
  await page.getByPlaceholder(/10-digit mobile number/i).fill('9000000000')
  await page.getByRole('button', { name: /save customer/i }).click()

  await expect(page.getByRole('heading', { name: /^add customer$/i })).toBeHidden()
  await expect(page.getByText('Rahul Traders')).toBeVisible()
})

test('create invoice flow', async ({ page }) => {
  await login(page)
  await page.goto('/dashboard/invoices')

  await expect(page.getByRole('heading', { name: /billing overview/i })).toBeVisible()
  await expect(page.getByText('INV-1021')).toBeVisible()
  await page.getByPlaceholder(/search by id or customer/i).fill('Rahul')
  await expect(page.getByText('Rahul Traders')).toBeVisible()
})
