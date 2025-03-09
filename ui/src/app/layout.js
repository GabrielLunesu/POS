'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastProvider from '@/components/ui/ToastProvider';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'POS System',
//   description: 'Point of Sale System',
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        {/* Wrap the app with our providers */}
        <AuthProvider>
          {/* Add toast notifications */}
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
