import React from 'react';
import Card from '../Card';
import Button from '../Button';
import Input from '../Input';

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClear, 
  filterConfig = [],
  className = '' 
}) => {
  return (
    <Card className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
          {filterConfig.map((filter) => (
            <div key={filter.name} className="w-full">
              {filter.type === 'select' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {filter.label}
                  </label>
                  <select
                    name={filter.name}
                    value={filters[filter.name] || ''}
                    onChange={onFilterChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : filter.type === 'date' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {filter.label}
                  </label>
                  <Input
                    type="date"
                    name={filter.name}
                    value={filters[filter.name] || ''}
                    onChange={onFilterChange}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {filter.label}
                  </label>
                  <Input
                    type="text"
                    name={filter.name}
                    value={filters[filter.name] || ''}
                    onChange={onFilterChange}
                    placeholder={filter.placeholder}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {onClear && (
          <div className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClear}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FilterBar;

