import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '', 
  variant = 'default',
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white shadow-md',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-gray-200',
    flat: 'bg-white',
  };

  return (
    <div 
      className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`} 
      {...props}
    >
      {title && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;

