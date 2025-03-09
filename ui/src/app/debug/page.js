'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function DebugPage() {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">Loading:</div>
            <div>{loading ? 'True' : 'False'}</div>
            
            <div className="font-medium">Authenticated:</div>
            <div>{isAuthenticated ? 'True' : 'False'}</div>
            
            <div className="font-medium">Token Exists:</div>
            <div>{token ? 'Yes' : 'No'}</div>
            
            {token && (
              <>
                <div className="font-medium">Token Length:</div>
                <div>{token.length} characters</div>
                
                <div className="font-medium">Token Preview:</div>
                <div className="break-all">{token.substring(0, 20)}...</div>
              </>
            )}
          </div>
        </div>
        
        {user && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">User ID:</div>
              <div>{user.id}</div>
              
              <div className="font-medium">Username:</div>
              <div>{user.username}</div>
              
              <div className="font-medium">Email:</div>
              <div>{user.email}</div>
              
              <div className="font-medium">Role:</div>
              <div className="font-bold text-blue-600">{user.role}</div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Role Requirements</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="mb-4">The following pages have these role requirements:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Products Page:</strong> Admin, Manager</li>
              <li><strong>Categories Page:</strong> Admin, Manager</li>
              <li><strong>Sales Page:</strong> No specific role required (any authenticated user)</li>
              <li><strong>Dashboard:</strong> No specific role required (any authenticated user)</li>
              <li><strong>POS:</strong> No specific role required (any authenticated user)</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 