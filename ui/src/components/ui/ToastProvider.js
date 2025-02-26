'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast notification provider component
 * Wraps the react-hot-toast Toaster component with custom styling
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default toast styling
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Custom toast types
        success: {
          duration: 3000,
          style: {
            background: '#22c55e',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastProvider; 