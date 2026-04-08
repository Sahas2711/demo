import api from "./axiosInstance";
import type {
  CustomerRequest,
  CustomerResponse,
  CustomerPurchaseHistoryResponse,
  MessageResponse,
  Page,
  PageParams,
} from "./types";

const BASE = "/v1/customers";

export const customerApi = {
  createCustomer: (data: CustomerRequest) =>
    api.post<CustomerResponse>(BASE, data),

  getCustomers: (params?: PageParams) =>
    api.get<Page<CustomerResponse>>(BASE, { params }),

  getCustomerById: (id: string) =>
    api.get<CustomerResponse>(`${BASE}/${id}`),

  updateCustomer: (id: string, data: CustomerRequest) =>
    api.put<CustomerResponse>(`${BASE}/${id}`, data),

  deleteCustomer: (id: string) =>
    api.delete<MessageResponse>(`${BASE}/${id}`),

  getPurchaseHistory: (id: string) =>
    api.get<CustomerPurchaseHistoryResponse[]>(`${BASE}/${id}/purchase-history`),
};
