import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send httpOnly cookies set by backend
});

// ── Request interceptor: attach Bearer token ─────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token refresh queue ──────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

/** URLs that should never trigger a token refresh retry */
const AUTH_URLS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

function isAuthUrl(url?: string): boolean {
  if (!url) return false;
  return AUTH_URLS.some((path) => url.includes(path));
}

/** Clear all auth data from localStorage */
function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// ── Response interceptor: auto-refresh on 401 ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 401 on a protected API call → attempt token refresh ──
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthUrl(originalRequest.url)
    ) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Call refresh endpoint (use raw axios to avoid interceptor loop)
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/v1/auth/refresh`,
          null,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Refresh-Token": refreshToken,
            },
            withCredentials: true,
          }
        );

        const { accessToken, refreshToken: newRefresh, user } = res.data;

        // Persist new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefresh);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        // Resolve all queued requests with the new token
        processQueue(null, accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → session expired → redirect to login
        clearStoredAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 401 on auth URLs or already-retried → force logout ───
    if (status === 401 && !isAuthUrl(originalRequest.url)) {
      clearStoredAuth();
      window.location.href = "/login";
    }

    // ── 403 Forbidden → user role doesn't match ──────────────
    if (status === 403 && !isAuthUrl(originalRequest.url)) {
      // Role mismatch or account disabled — redirect to login
      clearStoredAuth();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
