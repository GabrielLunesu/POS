'use client';

import Image from 'next/image';

/**
 * Authentication layout component
 * Provides a consistent layout for auth pages (login, register)
 * 
 * @param {React.ReactNode} children - Page content
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with logo */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="text-2xl font-bold text-blue-600">POS System</div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} POS System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout; 