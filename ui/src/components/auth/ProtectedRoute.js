'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Protected route component
 * Redirects unauthenticated users to the login page
 * 
 * @param {React.ReactNode} children - Page content
 * @param {string[]} allowedRoles - Roles allowed to access the route (optional)
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip check while loading
    if (loading) {
      console.log('ProtectedRoute: Still loading auth state...');
      return;
    }
    
    // Enhanced token debugging
    const token = localStorage.getItem('token');
    const tokenInfo = token 
      ? `Token exists (length: ${token.length}, starts with: ${token.substring(0, 10)}...)`
      : 'No token';
    
    console.log('ProtectedRoute: Auth state loaded', { 
      isAuthenticated, 
      user, 
      allowedRoles,
      tokenInfo
    });
    
    // Check if token exists but user is not authenticated
    if (token && !isAuthenticated) {
      console.warn('WARNING: Token exists but user is not authenticated. This indicates a potential issue with token processing.');
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    // Check role-based access if roles are specified
    if (allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => hasRole(role));
      console.log('ProtectedRoute: Role check', { allowedRoles, userRole: user?.role, hasAccess });
      
      if (!hasAccess) {
        // Redirect to dashboard if authenticated but not authorized
        console.log('ProtectedRoute: User not authorized, redirecting to dashboard');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, hasRole, loading, router, allowedRoles, user]);

  // Show nothing while loading or redirecting
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If roles are specified, check authorization
  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => hasRole(role));
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute; 