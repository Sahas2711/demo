import api from "./axiosInstance";
import type {
  InvoiceCreateRequest,
  InvoiceResponse,
  UpdateInvoiceStatusRequest,
  Page,
  PageParams,
} from "./types";

const BASE = "/v1/invoices";

export const billingApi = {
  createInvoice: (data: InvoiceCreateRequest) =>
    api.post<InvoiceResponse>(BASE, data),

  getInvoices: (params?: PageParams) =>
    api.get<Page<InvoiceResponse>>(BASE, { params }),

  getInvoiceById: (id: string) =>
    api.get<InvoiceResponse>(`${BASE}/${id}`),

  updateInvoiceStatus: (id: string, data: UpdateInvoiceStatusRequest) =>
    api.put<InvoiceResponse>(`${BASE}/${id}/status`, data),
};
