'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * ProductGrid component
 * Displays a grid of products/dishes for the selected category
 */
export default function ProductGrid({ products, category, onAddToCart }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with category name and view controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">{category?.name || 'All Products'}</h2>
          <span className="ml-2 text-sm text-gray-500">({products.length})</span>
        </div>
        
        <div className="flex space-x-2">
          {/* Grid/List view toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button 
              className={`p-1 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              className={`p-1 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
              onClick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Filter button - can be implemented later */}
          <button className="p-1 border rounded-md text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Add new product button */}
      <div className="p-4 border-b">
        <button 
          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
          onClick={() => {/* Add product functionality can be added later */}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Dish to {category?.name || 'Products'}
        </button>
      </div>
      
      {/* Products grid */}
      <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}`}>
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.id} 
              className={`${
                viewMode === 'grid' 
                  ? 'border rounded-lg overflow-hidden hover:shadow-md transition-shadow' 
                  : 'flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow'
              }`}
            >
              <div className={`${viewMode === 'grid' ? 'w-full h-40 relative' : 'w-24 h-24 relative'}`}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Optional: Add a checkbox for selection */}
                <div className="absolute top-2 right-2">
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              </div>
              
              <div className={`${viewMode === 'grid' ? 'p-3' : 'flex-1 p-3 flex flex-col justify-between'}`}>
                <div>
                  <div className="text-xs text-gray-500">{product.category?.name || 'Dessert'}</div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="font-semibold text-gray-900">${product.price.toFixed(2)}</div>
                  <button 
                    className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    onClick={() => onAddToCart(product)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No products found in this category
          </div>
        )}
      </div>
    </div>
  );
} 