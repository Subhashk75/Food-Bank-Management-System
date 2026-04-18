export const API_BASE = 'https://food-bank-management-system-1.onrender.com//api/v1';

const apiRequest = async (endpoint, method, data = null) => {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = data instanceof FormData;
  const config = {
    method,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  };

  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Server connection failed. Please try again later.');
    }
    throw error;
  }
};

export const authService = {
  register: (data) => apiRequest('/user/register', 'POST', data),
  login: (data) => apiRequest('/user/login', 'POST', data),
  requestOtp: (code) => apiRequest('/user/getOtp', 'POST', code),
};

export const productService = {
  create: (data) => apiRequest('/product', 'POST', data),
  getAll: () => apiRequest('/product', 'GET'),
  getById: (id) => apiRequest(`/product/${id}`, 'GET'),
  search: (query) => apiRequest(`/product/search?name=${encodeURIComponent(query)}`, 'GET'),
  update: (id, data) => apiRequest(`/product/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/product/${id}`, 'DELETE'),
  updateQuantity: (id, data) => apiRequest(`/product/${id}/quantity`, 'PATCH', data),
};

export const distributionService = {
  // getAll: () => apiRequest('/distribution', 'GET'),
  create: (data) => apiRequest('/distribution', 'POST', data),
  // update: (id, data) => apiRequest(`/distribution/${id}`, 'PUT', data),
  // restore: () => apiRequest('/distribution/restore', 'POST'), // Added this
};

export const transactionService = {
  getAll: () => apiRequest('/transaction', 'GET'),
  getById: (id) => apiRequest(`/transaction/${id}`, 'GET'),
  create: (data) => apiRequest('/transaction', 'POST', data),
  update: (id, data) => apiRequest(`/transaction/${id}`, 'PUT', data),
  restore: () => apiRequest('/transaction/restore', 'POST'), // Keeping this too
};

export const categoryService = {
  getAll: () => apiRequest('/categories', 'GET'),
  create: (data) => apiRequest('/categories', 'POST', data),
};

export const inventoryService = {
  getAll: () => apiRequest('/inventory', 'GET'),
  create: (data) => apiRequest('/inventory', 'POST', data),
  receive: (data) => apiRequest('/inventory/receive', 'POST', data),
};

export default {
  authService,
  productService,
  categoryService,
  transactionService,
  distributionService,
  inventoryService,
};