import React from 'react';
import Card from '../Card';

const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <Card className={`${className}`}>
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </Card>
  );
};

export default LoadingState;

