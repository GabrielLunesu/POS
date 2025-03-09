'use client';

/**
 * POS Layout component
 * Provides a specialized layout for the POS cashier interface
 */
export default function POSLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 