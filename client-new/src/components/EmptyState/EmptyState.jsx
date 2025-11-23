import React from 'react';

const EmptyState = ({ 
  icon = '📋',
  title = 'No data available',
  message = 'There is no data to display at the moment.',
  action,
  className = '' 
}) => {
  return (
    <div className={`py-12 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

