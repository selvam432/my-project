import axios from 'axios'

// ── Render backend URL ────────────────────────────────────────
// VITE_API_URL is set in Vercel Environment Variables
// Local dev: falls back to /api (Vite proxy → localhost:5000)
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
})

// ── Attach JWT token to every request ────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Let browser set Content-Type for FormData (multipart uploads)
  // For regular requests, default to JSON
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

// ── Handle errors ─────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.status, err.response?.data)

    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
