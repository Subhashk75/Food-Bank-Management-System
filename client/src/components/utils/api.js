import axios from 'axios';

export const API_BASE = 'https://food-bank-management-system-1.onrender.com/api/v1';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error message extraction
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const status = error.response?.status;
    
    console.error(`API Error [${status}]:`, message);

    // Create a custom error object to be caught by components
    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

export const authService = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  requestOtp: (data) => api.post('/user/getOtp', data),
  checkOtpStatus: (data) => api.post('/user/otp-status', data),
  verifyLoginOtp: (data) => api.post('/verify-login-otp', data),
};

export const productService = {
  create: (data) => api.post('/product', data),
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  search: (query) => api.get(`/product/search?name=${encodeURIComponent(query)}`),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
  updateQuantity: (id, data) => api.patch(`/product/${id}/quantity`, data),
};

export const distributionService = {
  create: (data) => api.post('/distribution', data),
};

export const transactionService = {
  getAll: () => api.get('/transaction'),
  getById: (id) => api.get(`/transaction/${id}`),
  create: (data) => api.post('/transaction', data),
  update: (id, data) => api.put(`/transaction/${id}`, data),
  restore: () => api.post('/transaction/restore'),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};

export const inventoryService = {
  getAll: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  receive: (data) => api.post('/inventory/receive', data),
};

export default {
  authService,
  productService,
  categoryService,
  transactionService,
  distributionService,
  inventoryService,
};