import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import Button from '../Button';

const Navbar = ({ onMenuToggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('userRole');

  const isLoggedIn = !!token;
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setShowProfileMenu(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (userRole === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Hamburger Menu (Mobile) & Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Only show on mobile when logged in and not on login page */}
            {isLoggedIn && !isLoginPage && onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 sm:hidden"
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (isLoggedIn) {
                  userRole === 'super_admin' 
                    ? navigate('/admin/dashboard')
                    : navigate('/dashboard');
                } else {
                  navigate('/');
                }
              }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Watertank
              </h1>
            </div>
          </div>

          {/* Right Side - Language Switcher & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {!isLoginPage && (
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name || user?.email || 'User'}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {userRole?.replace('_', ' ') || 'User'}
                        </p>
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {t('admin.dashboard')}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              !isLoginPage && (
                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  size="small"
                  className="hidden sm:inline-flex"
                >
                  {t('common.login')}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

