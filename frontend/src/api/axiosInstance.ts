import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Token stored here; AuthContext writes to this after login
export let memoryToken: string | null = null;
export function setMemoryToken(t: string | null) { memoryToken = t; }

// Toast callback registered by App.tsx so interceptors can show errors
let _showToast: ((msg: string, type?: string) => void) | null = null;
export function registerToast(fn: (msg: string, type?: string) => void) { _showToast = fn; }

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  if (memoryToken) config.headers.Authorization = `Bearer ${memoryToken}`;
  return config;
});

// On 401, clear user and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? "";
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh");
      if (!isAuthRoute) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
