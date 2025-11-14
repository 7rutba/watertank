import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import './DriverNav.css';

const DriverNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/driver/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/driver/collection', label: t('collection.addCollection'), icon: '💧' },
    { path: '/driver/delivery', label: t('delivery.addDelivery'), icon: '🚚' },
    { path: '/driver/expense', label: t('expense.addExpense'), icon: '💰' },
    { path: '/driver/history', label: t('common.recent'), icon: '📜' },
  ];

  return (
    <nav className="driver-nav">
      <div className="nav-items">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default DriverNav;

