'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

// Create the authentication context
const AuthContext = createContext();

/**
 * Authentication provider component
 * Manages authentication state and provides auth-related functions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  /**
   * Login user
   * @param {string} username - User's username
   * @param {string} password - User's password
   */
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };
  
  /**
   * Register new user
   * @param {string} username - User's username
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const register = async (username, email, password) => {
    try {
      const data = await authService.register(username, email, password);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || 
                            (typeof error.response.data === 'string' ? error.response.data : 'Registration failed');
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Registration failed');
      }
    }
  };
  
  /**
   * Logout user
   */
  const logout = () => {
    // Clear user data and token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  
  /**
   * Check if user has required role
   * @param {string|string[]} requiredRoles - Required role(s)
   * @returns {boolean} - Role check result
   */
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    
    // If no specific role is required, any authenticated user is allowed
    if (!requiredRoles) return true;
    
    // Convert single role to array for consistent handling
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user has any of the required roles
    return roles.includes(user.role);
  };
  
  // Compute isAuthenticated value
  const isAuthenticated = !!user;
  
  // Context value with auth state and functions
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 * @returns {Object} - Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 