import { useState, useEffect } from 'react';
import api from '../utils/api';
import { getStoredPermissions } from '../utils/permissions';

/**
 * Custom hook to manage user permissions
 * Fetches permissions from server and provides helper functions
 */
const usePermissions = () => {
  const [permissions, setPermissions] = useState(getStoredPermissions());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.permissions) {
          setPermissions(response.data.permissions);
          // Update localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({
            ...user,
            permissions: response.data.permissions,
          }));
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Use stored permissions as fallback
        setPermissions(getStoredPermissions());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permissionKey) => {
    return permissions[permissionKey] === true;
  };

  const hasAnyPermission = (permissionKeys = []) => {
    return permissionKeys.some(key => permissions[key] === true);
  };

  const hasAllPermissions = (permissionKeys = []) => {
    return permissionKeys.every(key => permissions[key] === true);
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default usePermissions;

