'use client';

import React from 'react';

// Button variants
const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50',
};

// Button sizes
const sizes = {
  sm: 'py-1 px-2 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

/**
 * Button component with different variants and sizes
 * 
 * @param {string} variant - Button style variant (primary, secondary, success, danger, warning, outline)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {boolean} disabled - Whether the button is disabled
 * @param {function} onClick - Click handler function
 * @param {string} type - Button type (button, submit, reset)
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) => {
  // Combine all classes
  const buttonClasses = `
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    rounded-md font-medium transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 