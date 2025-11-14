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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{t('common.unauthorized') || 'Unauthorized Access'}</h2>
        <p>{t('common.accessDenied') || 'You do not have permission to access this page.'}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

