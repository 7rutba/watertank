import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('common.unauthorized')}
          </h2>
          <p className="text-gray-600">{t('common.accessDenied')}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

