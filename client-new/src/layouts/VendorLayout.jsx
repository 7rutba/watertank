import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import usePermissions from '../hooks/usePermissions';

const VendorLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasPermission } = usePermissions();

  // Menu items based on vendor permissions
  const allMenuItems = [
    { 
      path: '/vendor/dashboard', 
      label: t('vendor.dashboard'), 
      icon: '📊',
      permission: null, // Always visible
    },
    { 
      path: '/vendor/drivers', 
      label: t('vendor.drivers'), 
      icon: '👨‍✈️',
      permission: 'canManageDrivers',
    },
    { 
      path: '/vendor/vehicles', 
      label: t('vendor.vehicles'), 
      icon: '🚛',
      permission: 'canManageVehicles',
    },
    { 
      path: '/vendor/suppliers', 
      label: t('vendor.suppliers'), 
      icon: '🏭',
      permission: 'canManageSuppliers',
    },
    { 
      path: '/vendor/societies', 
      label: t('vendor.societies'), 
      icon: '🏘️',
      permission: 'canManageSocieties',
    },
    { 
      path: '/vendor/collections', 
      label: t('vendor.collections'), 
      icon: '💧',
      permission: 'canViewAllTransactions',
    },
    { 
      path: '/vendor/deliveries', 
      label: t('vendor.deliveries'), 
      icon: '🚚',
      permission: 'canViewAllTransactions',
    },
    { 
      path: '/vendor/expenses', 
      label: t('vendor.expenses'), 
      icon: '💰',
      permission: 'canApproveExpenses',
    },
    { 
      path: '/vendor/invoices', 
      label: t('vendor.invoices'), 
      icon: '📄',
      permission: 'canManageInvoices',
    },
    { 
      path: '/vendor/payments', 
      label: t('vendor.payments'), 
      icon: '💳',
      permission: 'canViewFinancials',
    },
    { 
      path: '/vendor/reports', 
      label: t('vendor.reports'), 
      icon: '📈',
      permission: 'canGenerateReports',
    },
    { 
      path: '/vendor/financials', 
      label: t('vendor.financials'), 
      icon: '💵',
      permission: 'canViewFinancials',
    },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 fixed h-full z-50 ${
          mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full sm:translate-x-0'
        } ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {(sidebarOpen || mobileMenuOpen) && (
              <h1 className="text-xl font-bold text-primary">Watertank</h1>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded sm:hidden"
              >
                ✕
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden sm:block p-2 hover:bg-gray-100 rounded"
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            </div>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {(sidebarOpen || mobileMenuOpen) && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {(sidebarOpen || mobileMenuOpen) && (
              <span className="font-medium">{t('common.logout')}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'sm:ml-64' : 'sm:ml-20'
      }`}>
        {/* Navbar */}
        <Navbar onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;

