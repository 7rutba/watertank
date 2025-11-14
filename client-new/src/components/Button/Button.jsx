import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-gray-600 focus:ring-gray-500',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-warning text-gray-800 hover:bg-yellow-600 focus:ring-yellow-500',
    info: 'bg-info text-white hover:bg-cyan-700 focus:ring-cyan-500',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };
  
  const sizeClasses = {
    small: 'text-sm py-1.5 px-3',
    medium: 'text-base py-2 px-4',
    large: 'text-lg py-3 px-6',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

