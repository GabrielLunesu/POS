import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5124/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API service
 */
export const authService = {
  /**
   * Login user
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} - Response with user data and token
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  /**
   * Register new user
   * @param {string} username - User's username
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Response with registration status
   */
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
};

/**
 * Products API service
 */
export const productService = {
  /**
   * Get all products
   * @returns {Promise} - Response with products data
   */
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise} - Response with product data
   */
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  /**
   * Create new product
   * @param {Object} product - Product data
   * @returns {Promise} - Response with created product
   */
  create: async (product) => {
    const response = await api.post('/products', product);
    return response.data;
  },
  
  /**
   * Update existing product
   * @param {number} id - Product ID
   * @param {Object} product - Updated product data
   * @returns {Promise} - Response with updated product
   */
  update: async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  
  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise} - Response with deletion status
   */
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

/**
 * Categories API service
 */
export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} - Response with categories data
   */
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise} - Response with category data
   */
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  /**
   * Create new category
   * @param {Object} category - Category data
   * @returns {Promise} - Response with created category
   */
  create: async (category) => {
    const response = await api.post('/categories', category);
    return response.data;
  },
  
  /**
   * Update existing category
   * @param {number} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise} - Response with updated category
   */
  update: async (id, category) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },
  
  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise} - Response with deletion status
   */
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

/**
 * Sales API service
 */
export const saleService = {
  /**
   * Get all sales
   * @returns {Promise} - Response with sales data
   */
  getAll: async () => {
    const response = await api.get('/sales');
    return response.data;
  },
  
  /**
   * Get sale by ID
   * @param {number} id - Sale ID
   * @returns {Promise} - Response with sale data
   */
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
  
  /**
   * Create new sale
   * @param {Object} sale - Sale data
   * @returns {Promise} - Response with created sale
   */
  create: async (sale) => {
    const response = await api.post('/sales', sale);
    return response.data;
  },
};

export default api; 