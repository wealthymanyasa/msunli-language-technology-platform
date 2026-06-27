import axios from "axios"
import { useAuthStore } from "@/store/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; token_type: string }>("/auth/login/json", {
      username: data.email,
      password: data.password,
    }),
  me: () => api.get("/auth/me"),
}

export const nlpApi = {
  process: (data: {
    text: string
    language: string
    clean?: boolean
    tokenize?: boolean
    pos?: boolean
    ner?: boolean
    morphology?: boolean
  }) => api.post("/api/v1/process", data),
  tokenize: (data: { text: string; language: string }) =>
    api.post("/api/v1/tokenize", data),
  detectLanguage: (data: { text: string }) =>
    api.post("/api/v1/detect-language", data),
}

export const analyticsApi = {
  getStatistics: () => api.get("/api/v1/statistics"),
}

export const adminApi = {
  listUsers: () => api.get("/admin/users"),
  updateRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
  toggleActive: (userId: string) =>
    api.patch(`/admin/users/${userId}/toggle-active`),
}

export const openApiService = {
  getSpec: () => api.get("/openapi.json"),
}
