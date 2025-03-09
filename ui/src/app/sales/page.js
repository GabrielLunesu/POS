'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { saleService } from '@/services/api';
import Receipt from '@/components/pos/Receipt';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, hasRole } = useAuth();
  
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  
  // Fetch sales on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
        
        // Fetch sales
        const salesData = await saleService.getAll();
        setSales(salesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast.error('Failed to load sales');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, router]);
  
  // View receipt
  const handleViewReceipt = async (saleId) => {
    try {
      setIsLoading(true);
      const sale = await saleService.getById(saleId);
      setCurrentSale(sale);
      setShowReceipt(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast.error('Failed to load receipt');
      setIsLoading(false);
    }
  };
  
  // Close receipt modal
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCurrentSale(null);
  };
  
  // Void sale
  const handleVoidSale = async (saleId) => {
    if (!confirm('Are you sure you want to void this sale? This action cannot be undone.')) return;
    
    try {
      setIsLoading(true);
      await saleService.voidSale(saleId);
      
      // Update sales list
      setSales(prev => 
        prev.map(sale => 
          sale.id === saleId ? { ...sale, status: 'Voided' } : sale
        )
      );
      
      toast.success('Sale voided successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('Error voiding sale:', error);
      toast.error('Failed to void sale');
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sales History</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Receipt #</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Items</th>
                  <th className="px-4 py-2 border">Total</th>
                  <th className="px-4 py-2 border">Payment</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id} className={sale.status === 'Voided' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 border">{sale.id}</td>
                    <td className="px-4 py-2 border">{formatDate(sale.saleDate)}</td>
                    <td className="px-4 py-2 border text-center">{sale.items.length}</td>
                    <td className="px-4 py-2 border">${sale.grandTotal.toFixed(2)}</td>
                    <td className="px-4 py-2 border">{sale.paymentMethod}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sale.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'Voided' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleViewReceipt(sale.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                      >
                        View
                      </button>
                      {sale.status === 'Completed' && hasRole(['Admin', 'Manager']) && (
                        <button
                          onClick={() => handleVoidSale(sale.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center">No sales found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Receipt Modal */}
        {showReceipt && currentSale && (
          <Receipt sale={currentSale} onClose={handleCloseReceipt} />
        )}
      </div>
    </ProtectedRoute>
  );
} 