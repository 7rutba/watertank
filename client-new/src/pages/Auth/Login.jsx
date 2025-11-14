import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      // Store token and user data
      if (response.data.token) {
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          vendorId: response.data.vendorId,
          societyId: response.data.societyId,
          permissions: response.data.permissions || {},
        };
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role || 'super_admin');
        localStorage.setItem('user', JSON.stringify(userData));
        
            // Redirect based on role
            const role = response.data.role || 'super_admin';
            if (role === 'super_admin') {
              navigate('/admin/dashboard');
            } else if (role === 'vendor') {
              navigate('/vendor/dashboard');
            } else if (role === 'driver') {
              navigate('/driver/dashboard');
            } else if (role === 'accountant') {
              navigate('/vendor/dashboard'); // Accountant uses vendor dashboard
            } else if (role === 'society_admin') {
              navigate('/society/dashboard');
            } else {
              navigate('/dashboard');
            }
      }
    } catch (err) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <Card className="shadow-xl w-full">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">💧</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {t('auth.login')}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Sign in to your Super Admin account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span className="break-words">{error}</span>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <Input
                label={t('auth.email')}
                type="email"
                name="email"
                placeholder="admin@watertank.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="mb-0"
              />

              {/* Password Input */}
              <Input
                label={t('auth.password')}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="mb-0"
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-600">{t('auth.rememberMe')}</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:text-primary-hover font-medium text-xs sm:text-sm"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('auth.loginButton')
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-center text-xs sm:text-sm text-gray-500">
                Need help?{' '}
                <a href="#" className="text-primary hover:text-primary-hover font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </Card>

          {/* Demo Credentials Info (for development) */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-700">Email: admin@watertank.com</p>
              <p className="text-xs text-blue-700">Password: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
