'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/layouts/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Login page component
 * Displays the login form and handles redirects for authenticated users
 */
export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to POS if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/pos');
    }
  }, [isAuthenticated, loading, router]);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
} 