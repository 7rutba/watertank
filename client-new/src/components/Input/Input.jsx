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
  const baseClasses = 'block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  return (
    <div className={`mb-3 sm:mb-4 ${className}`}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} text-sm sm:text-base`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;

