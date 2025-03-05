'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

/**
 * POS Layout component
 * Provides a specialized layout for the POS cashier interface
 */
export default function POSLayout({ children }) {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/pos" className="text-xl font-bold text-blue-600">
                  Tasty Station
                </Link>
              </div>
            </div>
            
            {/* Search bar - can be implemented later */}
            <div className="flex-1 max-w-md mx-4 hidden md:flex items-center">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search menu, orders and more"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    onClick={toggleUserMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
                      <span className="text-xs text-gray-500 ml-1">Admin</span>
                    </div>
                  </button>
                </div>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Dashboard
                    </Link>
                    
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Your Profile
                    </Link>
                    
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                      onClick={logout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 