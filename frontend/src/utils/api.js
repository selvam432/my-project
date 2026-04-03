import axios from 'axios'

// ── API Base URL ──────────────────────────────────────────────
// In production (Vercel), VITE_API_URL will be your Render backend URL
// In local development, it falls back to /api (proxied by Vite)
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,  // false for cross-origin Render + Vercel
  headers: {
    'Content-Type': 'application/json',
  }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
