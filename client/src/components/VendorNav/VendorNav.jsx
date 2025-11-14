import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import './VendorNav.css';

const VendorNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/vendor/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/vendor/suppliers', label: t('supplier.title'), icon: '🏭' },
    { path: '/vendor/societies', label: t('society.title'), icon: '🏘️' },
    { path: '/vendor/vehicles', label: t('vehicle.title'), icon: '🚛' },
    { path: '/vendor/expenses', label: t('expense.title'), icon: '💰' },
    { path: '/vendor/invoices', label: t('invoice.title'), icon: '📄' },
    { path: '/vendor/payments', label: t('payment.title'), icon: '💳' },
    { path: '/vendor/reports', label: t('report.title'), icon: '📈' },
  ];

  return (
    <nav className="vendor-nav">
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

export default VendorNav;

