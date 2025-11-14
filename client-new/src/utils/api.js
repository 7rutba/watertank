import axios from 'axios';

// Create axios instance with base URL
// In Vite, use import.meta.env instead of process.env
// Environment variables must be prefixed with VITE_ to be exposed to the client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5004/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error('[API Response Error]', {
        status,
        url: error.config?.url,
        message: data?.message || error.message,
        data: data,
      });
      
      // Handle 401 Unauthorized - Clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden. You do not have permission to access this resource.');
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('Resource not found.');
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error. Please try again later.');
      }
      
      // Return error with response data
      return Promise.reject({
        ...error,
        message: data?.message || error.message || 'An error occurred',
        status,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Network Error]', {
        message: 'No response received from server',
        url: error.config?.url,
      });
      
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;

