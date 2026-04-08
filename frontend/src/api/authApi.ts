import api from "./axiosInstance";
import type { LoginRequest, RegisterRequest, TokenResponse, MessageResponse } from "./types";

const BASE = "/v1/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<TokenResponse>(`${BASE}/register`, data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>(`${BASE}/login`, data),

  refresh: () =>
    api.post<TokenResponse>(`${BASE}/refresh`),

  logout: () =>
    api.post<MessageResponse>(`${BASE}/logout`),
};
