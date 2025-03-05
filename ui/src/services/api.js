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
    
    // Enhanced token debugging
    if (token) {
      console.log(`Adding auth token to ${config.url}`);
      // Log a masked version of the token for debugging (first 10 chars + last 4)
      const tokenStart = token.substring(0, 10);
      const tokenEnd = token.length > 14 ? token.substring(token.length - 4) : '';
      console.log(`Token format: ${tokenStart}...${tokenEnd} (length: ${token.length})`);
      
      // Check if token is properly formatted
      if (!token.startsWith('ey')) {
        console.warn('WARNING: Token does not appear to be a valid JWT (should start with "ey")');
      }
      
      // Ensure Authorization header is properly set
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${tokenStart}...`);
    } else {
      console.log(`No auth token available for request to ${config.url}`);
      // Check if there's any auth header already set
      if (config.headers.Authorization) {
        console.log('Existing Authorization header:', config.headers.Authorization);
      }
    }
    
    // Log all headers being sent (for debugging)
    console.log('Request headers:', JSON.stringify(config.headers));
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
      
      // Check if the request had an Authorization header
      const authHeader = error.config.headers['Authorization'];
      if (authHeader) {
        console.log('Request had Authorization header:', authHeader.substring(0, 15) + '...');
      } else {
        console.warn('Request did NOT have Authorization header!');
      }
    }
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access (401). Clearing auth data and redirecting to login.');
      
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
 * Test backend connection
 * @returns {Promise} - Response with connection status
 */
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    // Try to access a public endpoint that doesn't require authentication
    const response = await api.get('/health', {
      timeout: 5000 // 5 second timeout
    });
    console.log('Backend connection test result:', response.status, response.data);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      error: error.message,
      hasResponse: !!error.response,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

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
    try {
      console.log('Sending login request with data:', { 
        username, 
        password: '********' // Don't log actual password
      });
      
      const response = await api.post('/auth/login', { username, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      
      // Extract error message from response if available
      if (error.response && error.response.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Login failed';
        throw new Error(errorMessage);
      }
      
      throw error; // Re-throw for component to handle
    }
  },
  
  /**
   * Register new user
   * @param {string} username - User's username
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Response with registration status
   */
  register: async (username, email, password) => {
    try {
      console.log('Registering user with data:', { 
        username, 
        email, 
        password: '********', // Don't log actual password
        confirmPassword: '********' 
      });
      
      const registerData = {
        username,
        email,
        password,
        confirmPassword: password, // Backend requires confirmPassword to match password
        role: "Employee" // Default role
      };
      
      const response = await api.post('/auth/register', registerData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API registration error:', error);
      throw error; // Re-throw for component to handle
    }
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
   * Get products by category ID
   * @param {number} categoryId - Category ID
   * @returns {Promise} - Response with products data
   */
  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
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
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  /**
   * Update existing product
   * @param {number} id - Product ID
   * @param {Object} product - Updated product data
   * @returns {Promise} - Response with updated product
   */
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
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
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  /**
   * Update existing category
   * @param {number} id - Category ID
   * @param {Object} category - Updated category data
   * @returns {Promise} - Response with updated category
   */
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
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
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },
  
  /**
   * Update existing sale
   * @param {number} id - Sale ID
   * @param {Object} sale - Updated sale data
   * @returns {Promise} - Response with updated sale
   */
  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },
  
  /**
   * Delete sale
   * @param {number} id - Sale ID
   * @returns {Promise} - Response with deletion status
   */
  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },
};

export default api; 