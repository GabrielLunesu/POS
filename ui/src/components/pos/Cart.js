'use client';

import { useState } from 'react';

/**
 * Cart component
 * Displays the current order items and checkout options
 */
export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate tax (assuming 10%)
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Cart header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Current Order</h2>
      </div>
      
      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start border-b pb-4">
                {/* Item image */}
                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Item details */}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <button 
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-500">
                    ${item.price.toFixed(2)} each
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center border rounded-md">
                      <button 
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-2 py-1 text-sm">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Your cart is empty
          </div>
        )}
      </div>
      
      {/* Cart summary */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment method selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`py-2 px-3 text-sm rounded-md ${
                paymentMethod === 'cash' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              Cash
            </button>
            <button
              className={`py-2 px-3 text-sm rounded-md ${
                paymentMethod === 'card' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              Card
            </button>
            <button
              className={`py-2 px-3 text-sm rounded-md ${
                paymentMethod === 'mobile' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setPaymentMethod('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={onClearCart}
            disabled={cartItems.length === 0}
          >
            Clear All
          </button>
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={() => onCheckout(paymentMethod)}
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
} 