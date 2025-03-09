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
        console.log('Initializing auth state from localStorage...');
        
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('Auth initialization:', {
          hasStoredUser: !!storedUser,
          hasStoredToken: !!storedToken,
          tokenLength: storedToken ? storedToken.length : 0,
          tokenPreview: storedToken ? `${storedToken.substring(0, 10)}...` : 'none'
        });
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Setting user from localStorage:', {
            id: parsedUser.id,
            username: parsedUser.username,
            role: parsedUser.role
          });
          setUser(parsedUser);
        } else {
          console.log('No valid auth data found in localStorage');
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
      console.log('Attempting login with username:', username);
      
      const data = await authService.login(username, password);
      console.log('Login response data:', data);
      
      // Validate the response contains the expected data
      if (!data || !data.token) {
        console.error('Invalid login response - missing token:', data);
        throw new Error('Invalid login response from server');
      }
      
      // Check token format
      if (typeof data.token !== 'string') {
        console.error('Token is not a string:', typeof data.token);
        throw new Error('Invalid token format received from server');
      }
      
      // Log token format (partially masked)
      const tokenPreview = `${data.token.substring(0, 10)}...${data.token.substring(data.token.length - 4)}`;
      console.log(`Token received: ${tokenPreview} (length: ${data.token.length})`);
      
      // The backend returns a UserResponseDto with user info and token
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role
      };
      
      console.log('Storing user data and token in localStorage');
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      
      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.error('Failed to store token in localStorage');
        throw new Error('Failed to store authentication data');
      }
      
      if (storedToken !== data.token) {
        console.error('Stored token does not match original token');
        throw new Error('Authentication data storage error');
      }
      
      console.log('Stored token verification:', 
        storedToken ? `Success (length: ${storedToken.length})` : 'Failed to store token');
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw for component to handle
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
    // Debug logging
    console.log('hasRole check:', { 
      user: user?.username,
      userRole: user?.role, 
      requiredRoles,
      hasUser: !!user
    });
    
    if (!user) return false;
    
    // If no specific role is required, any authenticated user is allowed
    if (!requiredRoles) return true;
    
    // Convert single role to array for consistent handling
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user has any of the required roles
    const result = roles.includes(user.role);
    console.log(`Role check result: ${result ? 'Allowed' : 'Denied'}`);
    return result;
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