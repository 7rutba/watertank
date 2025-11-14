/**
 * Permission utilities for frontend
 * Checks if user has specific permissions
 */

export const checkPermission = (permissions, permissionKey) => {
  if (!permissions) return false;
  return permissions[permissionKey] === true;
};

export const hasAnyPermission = (permissions, permissionKeys = []) => {
  if (!permissions || permissionKeys.length === 0) return false;
  return permissionKeys.some(key => permissions[key] === true);
};

export const hasAllPermissions = (permissions, permissionKeys = []) => {
  if (!permissions || permissionKeys.length === 0) return false;
  return permissionKeys.every(key => permissions[key] === true);
};

// Get permissions from localStorage
export const getStoredPermissions = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.permissions || {};
  } catch (error) {
    console.error('Error getting stored permissions:', error);
    return {};
  }
};

// Permission constants for Super Admin
export const SUPER_ADMIN_PERMISSIONS = {
  CAN_MANAGE_TENANTS: 'canManageTenants',
  CAN_VIEW_ALL_VENDORS: 'canViewAllVendors',
  CAN_MANAGE_SUBSCRIPTIONS: 'canManageSubscriptions',
  CAN_ACCESS_SYSTEM_SETTINGS: 'canAccessSystemSettings',
  CAN_VIEW_PLATFORM_ANALYTICS: 'canViewPlatformAnalytics',
  CAN_MANAGE_BILLING: 'canManageBilling',
  CAN_ACCESS_SUPPORT: 'canAccessSupport',
  CAN_CREATE_VENDORS: 'canCreateVendors',
  CAN_EDIT_VENDORS: 'canEditVendors',
  CAN_DELETE_VENDORS: 'canDeleteVendors',
  CAN_VIEW_VENDOR_DETAILS: 'canViewVendorDetails',
  CAN_MANAGE_SYSTEM_CONFIG: 'canManageSystemConfig',
};

