import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DropdownMenu = ({ 
  label, 
  icon, 
  items, 
  isActive = false,
  onItemClick,
  sidebarOpen = true,
  mobileMenuOpen = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!item || !item.path) {
      console.error('Invalid item or path:', item);
      return;
    }
    
    const path = item.path;
    console.log('Dropdown item clicked, path:', path); // Debug log
    
    setIsOpen(false);
    
    // Navigate directly using react-router navigate
    if (path) {
      console.log('Navigating directly to:', path); // Debug log
      navigate(path);
    }
    
    // Also call the callback if provided (for mobile menu closing, etc.)
    if (onItemClick) {
      onItemClick(path);
    }
  };

  const handleToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation();
    }
    setIsOpen(!isOpen);
  };

  // If sidebar is collapsed and not mobile menu, show simple icon button
  if (!sidebarOpen && !mobileMenuOpen) {
    return (
      <li className={className}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onItemClick) {
              onItemClick('/vendor/payments');
            }
          }}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title={label}
        >
          <span className="text-xl">{icon}</span>
        </button>
      </li>
    );
  }

  return (
    <li 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-300 pl-3 bg-gray-50 rounded-r-lg py-2">
          {items.map((item) => (
            <li key={item.path}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent?.stopImmediatePropagation();
                  console.log('Button clicked for:', item.path, item); // Debug
                  handleItemClick(item, e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.isActive
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-700 hover:bg-white'
                }`}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default DropdownMenu;

