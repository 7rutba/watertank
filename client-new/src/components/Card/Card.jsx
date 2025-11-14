import React from 'react';

const Card = ({ children, title, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6 ${className}`} {...props}>
      {title && (
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;

