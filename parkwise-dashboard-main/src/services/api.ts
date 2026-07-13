import axios from "axios";

const isServer = typeof window === "undefined";


export const API_BASE_URL = isServer 
  ? 'http://localhost:8080/api' 
  : (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api');
// -------------------

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, 
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("spms-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // If no token exists, remove the header to avoid sending stale auth
          delete config.headers.Authorization;
        }
      } else {
        // No auth data in localStorage, clear the header
        delete config.headers.Authorization;
      }
    } catch {
      // If parsing fails, clear the header
      delete config.headers.Authorization;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const errorMsg = err.response?.data?.error || "";
      const isLoginRequest = err.config?.url?.includes("/login");
      const isPasswordError = errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("credentials");
      
      // Only redirect for actual token expiration/missing token issues
      // Don't redirect if it's a login attempt or a wrong password error during settings update
      if (!isLoginRequest && !isPasswordError) {
        if (typeof window !== "undefined") {
          const isUser = window.location.pathname.startsWith("/user");
          localStorage.removeItem("spms-auth");
          sessionStorage.clear();
          window.location.href = isUser ? "/user/login" : "/admin/login";
        }
      }
    }
    return Promise.reject(err);
  },
);