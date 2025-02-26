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
    if (loading) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Check role-based access if roles are specified
    if (allowedRoles.length > 0) {
      const hasAccess = allowedRoles.some(role => hasRole(role));
      
      if (!hasAccess) {
        // Redirect to dashboard if authenticated but not authorized
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, hasRole, loading, router, allowedRoles]);

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