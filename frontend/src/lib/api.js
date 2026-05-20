import axios from 'axios'

import { getToken } from './auth'

const defaultBaseURL = (() => {
  // If the app is opened from another device (LAN), `localhost` points at that device.
  // Use the current page hostname by default so the backend resolves correctly.
  if (typeof window === 'undefined') return 'http://localhost:5000'
  const hostname = window.location?.hostname || 'localhost'
  const protocol = window.location?.protocol === 'https:' ? 'https:' : 'http:'
  return `${protocol}//${hostname}:5000`
})()

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Structured JSON responses: { success: true, data: ... }
export const flightsApi = {
  async list({ source } = {}) {
    const params = source ? { source } : undefined
    const res = await api.get('/flights', { params })
    return res.data?.data ?? []
  },
  async get(id, { source } = {}) {
    const params = source ? { source } : undefined
    const res = await api.get(`/flight/${id}`, { params })
    return res.data?.data ?? null
  },
}

export const authApi = {
  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password })
    return res.data?.data ?? null
  },
  async signup({ email, password, name }) {
    const res = await api.post('/auth/signup', { email, password, name })
    return res.data?.data ?? null
  },
  async me() {
    const res = await api.get('/auth/me')
    return res.data?.data ?? null
  },
}

export const weatherApi = {
  async current({ lat, lng }) {
    const res = await api.get('/weather/current', { params: { lat, lng } })
    return res.data?.data ?? null
  },
}

export default api
