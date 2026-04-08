import api from "./axiosInstance";
import type {
  CategoryRequest,
  CategoryResponse,
  ProductRequest,
  ProductResponse,
  StockAdjustmentRequest,
  MessageResponse,
  Page,
  PageParams,
} from "./types";

const CATEGORIES = "/v1/categories";
const PRODUCTS = "/v1/products";
const INVENTORY = "/v1/inventory";

export const inventoryApi = {
  // ─── Categories ──────────────────────────────────────────────────────────
  createCategory: (data: CategoryRequest) =>
    api.post<CategoryResponse>(CATEGORIES, data),

  getCategories: () =>
    api.get<CategoryResponse[]>(CATEGORIES),

  updateCategory: (id: string, data: CategoryRequest) =>
    api.put<CategoryResponse>(`${CATEGORIES}/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<MessageResponse>(`${CATEGORIES}/${id}`),

  // ─── Products ─────────────────────────────────────────────────────────────
  createProduct: (data: ProductRequest) =>
    api.post<ProductResponse>(PRODUCTS, data),

  getProducts: (params?: PageParams) =>
    api.get<Page<ProductResponse>>(PRODUCTS, { params }),

  getProductById: (id: string) =>
    api.get<ProductResponse>(`${PRODUCTS}/${id}`),

  updateProduct: (id: string, data: ProductRequest) =>
    api.put<ProductResponse>(`${PRODUCTS}/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<MessageResponse>(`${PRODUCTS}/${id}`),

  // ─── Inventory ────────────────────────────────────────────────────────────
  getInventory: (lowStock = false) =>
    api.get<ProductResponse[]>(INVENTORY, { params: { lowStock } }),

  getLowStockProducts: () =>
    api.get<ProductResponse[]>(`${INVENTORY}/low-stock`),

  adjustStock: (productId: string, data: StockAdjustmentRequest) =>
    api.put<ProductResponse>(`${INVENTORY}/${productId}`, data),
};
