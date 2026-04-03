// api.js — Axios instance pre-configured for our backend
// Automatically attaches the JWT token to every request

import axios from 'axios'

// Base URL — in dev this proxies through Vite to localhost:5000
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduease_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload
      localStorage.removeItem('eduease_token')
      localStorage.removeItem('eduease_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api