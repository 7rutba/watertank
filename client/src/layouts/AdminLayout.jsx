import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: t('nav.dashboard') },
    { path: '/admin/vendors', icon: '🏢', label: t('admin.vendors') || 'Vendors' },
    { path: '/admin/subscriptions', icon: '💳', label: t('admin.subscriptions') || 'Subscriptions' },
    { path: '/admin/analytics', icon: '📈', label: t('admin.analytics') || 'Analytics' },
    { path: '/admin/settings', icon: '⚙️', label: t('admin.settings') || 'Settings' },
    { path: '/admin/support', icon: '🎫', label: t('admin.support') || 'Support Tickets' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col z-50 shadow-xl transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      } md:w-64`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          {sidebarOpen && <h1 className="text-lg font-bold">💧 Watertank</h1>}
          <button 
            className="bg-white/10 hover:bg-white/20 w-8 h-8 rounded flex items-center justify-center text-lg transition-colors md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-1 ${
                isActive(item.path)
                  ? 'bg-white/20 font-semibold'
                  : 'hover:bg-white/10 opacity-90'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="text-xl min-w-[24px] text-center">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
            onClick={handleLogout}
          >
            <span className="text-xl min-w-[24px] text-center">🚪</span>
            {sidebarOpen && <span className="text-sm">{t('auth.logout') || 'Logout'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      } md:ml-64`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="text-2xl hover:text-gray-600 transition-colors md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {menuItems.find(item => isActive(item.path))?.label || t('nav.dashboard')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm font-semibold">
              🔴 {t('common.superAdmin')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

