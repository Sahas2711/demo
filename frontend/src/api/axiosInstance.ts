import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export let memoryToken: string | null = null;
export function setMemoryToken(t: string | null) { memoryToken = t; }

let _showToast: ((msg: string, type?: string) => void) | null = null;
export function registerToast(fn: (msg: string, type?: string) => void) { _showToast = fn; }

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  if (memoryToken) config.headers.Authorization = `Bearer ${memoryToken}`;
  return config;
});

// Response interceptor — only redirect on 401 for non-auth routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number = error.response?.status;
    const url: string = error.config?.url ?? "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      // Token is invalid/expired — clear and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      memoryToken = null;
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
