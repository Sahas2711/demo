// ── Types matching backend DTOs ───────────────────────────────

export interface Category {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  hsnCode: string
  unitPrice: number
  gstPercentage: number
  quantityAvailable: number
  reorderLevel: number
  lowStock: boolean
  active: boolean
  category: Category
  createdAt?: string
  updatedAt?: string
}

// Kept for backward compatibility in components that use these names
export const LOW_STOCK_THRESHOLD = 10
