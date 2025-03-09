'use client';

/**
 * Dashboard layout component
 * Provides a consistent layout for dashboard pages with navigation
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
} 