'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

/**
 * Receipt component
 * Displays a printable receipt for a completed sale
 */
export default function Receipt({ sale, onClose }) {
  const receiptRef = useRef();
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${sale.id}`,
    onAfterPrint: () => console.log('Printed successfully')
  });
  
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Receipt header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Receipt</h2>
          <div>
            <button
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Printable receipt content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div ref={receiptRef} className="p-4 bg-white">
            {/* Store info */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">Tasty Station</h1>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">City, State 12345</p>
              <p className="text-gray-600">Tel: (123) 456-7890</p>
            </div>
            
            {/* Receipt details */}
            <div className="mb-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Receipt #:</span>
                <span>{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{formatDate(sale.saleDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Cashier:</span>
                <span>{sale.userName || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>{sale.paymentMethod}</span>
              </div>
              {sale.paymentReference && (
                <div className="flex justify-between">
                  <span className="font-medium">Reference:</span>
                  <span>{sale.paymentReference}</span>
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div className="border-t border-dashed my-4"></div>
            
            {/* Items */}
            <div className="mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id} className="border-b border-dotted">
                      <td className="py-2">{item.productName}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="mb-4 text-sm">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Tax:</span>
                <span>${sale.tax.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between py-1">
                  <span>Discount:</span>
                  <span>-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold text-base border-t">
                <span>Total:</span>
                <span>${sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center text-sm mt-6">
              <p className="font-medium">Thank you for your purchase!</p>
              <p className="text-gray-600 mt-1">Please keep this receipt for your records.</p>
              {sale.notes && (
                <p className="mt-2 italic">{sale.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 