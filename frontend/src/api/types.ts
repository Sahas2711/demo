// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "STAFF" | "VIEWER";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface MessageResponse {
  message: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  hsnCode: string;
  unitPrice: number;
  gstPercentage: number;
  categoryId: string;
  quantityAvailable: number;
  reorderLevel: number;
  active?: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  hsnCode: string;
  unitPrice: number;
  gstPercentage: number;
  quantityAvailable: number;
  reorderLevel: number;
  lowStock: boolean;
  active: boolean;
  category: CategoryResponse;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentRequest {
  quantityAvailable: number;
  reorderLevel?: number;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface CustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  creditLimit?: number;
  active?: boolean;
}

export interface CustomerResponse {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  creditLimit: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPurchaseHistoryResponse {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  status: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";

export interface InvoiceItemCreateRequest {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface InvoiceCreateRequest {
  customerId: string;
  items: InvoiceItemCreateRequest[];
  notes?: string;
  dueDate?: string;
  interState: boolean;
}

export interface InvoiceItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  totalPrice: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  status: InvoiceStatus;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  notes?: string;
  dueDate?: string;
  items: InvoiceItemResponse[];
  createdAt: string;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
}
