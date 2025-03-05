'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * CategoryList component
 * Displays a list of categories for the POS interface
 */
export default function CategoryList({ categories, activeCategory, onCategorySelect }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Dishes Category</h2>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div 
            key={category.id}
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              activeCategory?.id === category.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => onCategorySelect(category)}
          >
            <div className="w-6 h-6 flex items-center justify-center mr-3">
              {category.icon || '🍽️'}
            </div>
            <span className={`text-sm ${activeCategory?.id === category.id ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              {category.name}
            </span>
            <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {category.productCount || 0}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <button 
          className="w-full flex items-center justify-center p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md"
          onClick={() => {/* Add category functionality can be added later */}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Add New Category
        </button>
      </div>
    </div>
  );
} 