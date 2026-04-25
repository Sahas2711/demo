import axios from "axios";
import type { ToastType } from "../context/ToastContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export let memoryToken: string | null = null;
export function setMemoryToken(t: string | null) { memoryToken = t; }

export function registerToast(_fn: (msg: string, type?: ToastType) => void) {}

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = memoryToken ?? localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — only redirect on 401 for non-auth routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number = error.response?.status;
    const url: string = error.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");
    const hasToken = !!localStorage.getItem('accessToken');

    if (status === 401 && !isAuthRoute && !hasToken) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      memoryToken = null;
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
