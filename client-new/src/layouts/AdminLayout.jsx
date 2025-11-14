import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import usePermissions from '../hooks/usePermissions';
import { SUPER_ADMIN_PERMISSIONS } from '../utils/permissions';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasPermission } = usePermissions();

  // Dynamic menu items based on permissions
  const allMenuItems = [
    { 
      path: '/admin/dashboard', 
      label: t('admin.dashboard'), 
      icon: '📊',
      permission: null, // Always visible
    },
    { 
      path: '/admin/vendors', 
      label: t('admin.vendors'), 
      icon: '🏢',
      permission: SUPER_ADMIN_PERMISSIONS.CAN_VIEW_ALL_VENDORS,
    },
    { 
      path: '/admin/analytics', 
      label: t('admin.analytics'), 
      icon: '📈',
      permission: SUPER_ADMIN_PERMISSIONS.CAN_VIEW_PLATFORM_ANALYTICS,
    },
    { 
      path: '/admin/subscriptions', 
      label: t('admin.subscriptions'), 
      icon: '💳',
      permission: SUPER_ADMIN_PERMISSIONS.CAN_MANAGE_SUBSCRIPTIONS,
    },
    { 
      path: '/admin/settings', 
      label: t('admin.settings'), 
      icon: '⚙️',
      permission: SUPER_ADMIN_PERMISSIONS.CAN_ACCESS_SYSTEM_SETTINGS,
    },
    { 
      path: '/admin/support', 
      label: t('admin.support'), 
      icon: '🎧',
      permission: SUPER_ADMIN_PERMISSIONS.CAN_ACCESS_SUPPORT,
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
    // Close mobile menu when navigating
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
          // Mobile: overlay sidebar
          mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full sm:translate-x-0'
        } ${
          // Desktop: always visible, can collapse
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {(sidebarOpen || mobileMenuOpen) && (
              <h1 className="text-xl font-bold text-primary">Watertank</h1>
            )}
            <div className="flex gap-2">
              {/* Mobile close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded sm:hidden"
              >
                ✕
              </button>
              {/* Desktop collapse button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden sm:block p-2 hover:bg-gray-100 rounded"
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            </div>
          </div>
        </div>

        <nav className="p-4">
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
        // Desktop: margin based on sidebar state
        sidebarOpen ? 'sm:ml-64' : 'sm:ml-20'
        // Mobile: no margin (sidebar overlays)
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

export default AdminLayout;

