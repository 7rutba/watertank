import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
        } ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : 'bg-white'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-600 mt-1">{error}</span>
      )}
    </div>
  );
};

export default Input;
