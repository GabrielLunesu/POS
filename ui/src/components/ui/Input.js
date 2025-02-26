'use client';

import React, { forwardRef } from 'react';

/**
 * Input component for forms
 * 
 * @param {string} type - Input type (text, password, email, etc.)
 * @param {string} id - Input ID
 * @param {string} name - Input name
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {boolean} required - Whether the input is required
 * @param {boolean} disabled - Whether the input is disabled
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 * @param {object} register - React Hook Form register function
 */
const Input = forwardRef(({
  type = 'text',
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-md
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 