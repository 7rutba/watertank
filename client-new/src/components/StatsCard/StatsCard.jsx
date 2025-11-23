import React from 'react';
import Card from '../Card';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBg = 'bg-blue-500',
  trend,
  className = '' 
}) => {
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${iconBg} p-3 rounded-xl flex-shrink-0 ml-4`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;

