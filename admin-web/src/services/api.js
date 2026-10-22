import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: Adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor: Lidar com erros (401 = logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// PRODUTOS
// ============================================

export const productService = {
  list: (page = 1, limit = 10, search = '') => {
    return api.get('/api/admin/products', {
      params: { page, limit, search }
    })
  },

  get: (id) => {
    return api.get(`/api/admin/products/${id}`)
  },

  create: (data) => {
    return api.post('/api/admin/products', data)
  },

  update: (id, data) => {
    return api.put(`/api/admin/products/${id}`, data)
  },

  delete: (id) => {
    return api.delete(`/api/admin/products/${id}`)
  },

  // Variações
  addVariant: (productId, data) => {
    return api.post(`/api/admin/products/${productId}/variants`, data)
  },

  updateVariant: (productId, variantId, data) => {
    return api.put(`/api/admin/products/${productId}/variants/${variantId}`, data)
  },

  deleteVariant: (productId, variantId) => {
    return api.delete(`/api/admin/products/${productId}/variants/${variantId}`)
  },

  updateStock: (productId, variantId, stock, reason = '') => {
    return api.put(
      `/api/admin/products/${productId}/variants/${variantId}/stock`,
      { stock, reason }
    )
  }
}

export default api
