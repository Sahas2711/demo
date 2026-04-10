import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'
import type { CategoryResponse, CustomerResponse, InvoiceResponse, ProductResponse } from '@/api/types'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { categories, customers, invoices, products } from '@/test/mocks/handlers'

interface RouterOptions extends RenderOptions {
  route?: string
  withAuth?: boolean
  withToast?: boolean
}

function Providers({ children, route = '/', withAuth = false, withToast = false }: { children: ReactNode } & RouterOptions) {
  let tree = <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  if (withAuth) tree = <AuthProvider>{tree}</AuthProvider>
  if (withToast) tree = <ToastProvider>{tree}</ToastProvider>
  return tree
}

export function renderWithProviders(ui: ReactElement, options: RouterOptions = {}) {
  const { route, withAuth, withToast, ...renderOptions } = options
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers route={route} withAuth={withAuth} withToast={withToast}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  })
}

export const fixtures: {
  category: CategoryResponse
  product: ProductResponse
  products: ProductResponse[]
  customer: CustomerResponse
  customers: CustomerResponse[]
  invoice: InvoiceResponse
  invoices: InvoiceResponse[]
} = {
  category: categories[0],
  product: products[0],
  products,
  customer: customers[0],
  customers,
  invoice: invoices[0],
  invoices,
}

export * from '@testing-library/react'
