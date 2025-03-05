'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

/**
 * Dashboard page component
 * Protected route that displays user information and basic stats
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Welcome, {user?.username || 'User'}!</h3>
              <p className="mt-1 text-sm text-gray-500">
                You are logged in as: {user?.role || 'User'}
              </p>
              
              {/* POS Quick Access Button */}
              <div className="mt-4">
                <a 
                  href="/pos" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center"
                >
                  Open POS Cashier System
                </a>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Sample dashboard cards */}
                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-blue-900">Products</h3>
                    <p className="mt-1 text-3xl font-semibold text-blue-700">0</p>
                  </div>
                </div>
                
                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-green-900">Sales Today</h3>
                    <p className="mt-1 text-3xl font-semibold text-green-700">$0.00</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-purple-900">Categories</h3>
                    <p className="mt-1 text-3xl font-semibold text-purple-700">0</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  No recent activity to display
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 