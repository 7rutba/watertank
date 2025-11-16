/**
 * Permission definitions for each role
 * Returns permissions object based on user role
 */

const getPermissionsByRole = (role) => {
  const permissions = {
    super_admin: {
      canManageTenants: true,
      canViewAllVendors: true,
      canManageSubscriptions: true,
      canAccessSystemSettings: true,
      canViewPlatformAnalytics: true,
      canManageBilling: true,
      canAccessSupport: true,
      canCreateVendors: true,
      canEditVendors: true,
      canDeleteVendors: true,
      canViewVendorDetails: true,
      canManageSystemConfig: true,
    },
    vendor: {
      canManageTenants: false,
      canViewAllVendors: false,
      canManageSubscriptions: false,
      canAccessSystemSettings: false,
      canViewPlatformAnalytics: false,
      canManageBilling: false,
      canAccessSupport: true,
      canManageDrivers: true,
      canManageVehicles: true,
      canManageSuppliers: true,
      canManageSocieties: true,
      canViewAllTransactions: true,
      canApproveExpenses: true,
      canGenerateReports: true,
      canManageInvoices: true,
      canViewFinancials: true,
      canManageAccountants: true,
    },
    accountant: {
      canManageTenants: false,
      canViewAllVendors: false,
      canManageSubscriptions: false,
      canAccessSystemSettings: false,
      canViewPlatformAnalytics: false,
      canManageBilling: false,
      canAccessSupport: true,
      canManageSupplierPayments: true,
      canRecordSocietyPayments: true,
      canApproveExpenses: true,
      canGenerateInvoices: true,
      canViewFinancials: true,
      canGenerateReports: true,
      canReconcileAccounts: true,
    },
    driver: {
      canManageTenants: false,
      canViewAllVendors: false,
      canManageSubscriptions: false,
      canAccessSystemSettings: false,
      canViewPlatformAnalytics: false,
      canManageBilling: false,
      canAccessSupport: true,
      canLogCollection: true,
      canLogDelivery: true,
      canSubmitExpense: true,
      canViewOwnTrips: true,
      canViewOwnExpenses: true,
      canUpdateProfile: true,
    },
    society_admin: {
      canManageTenants: false,
      canViewAllVendors: false,
      canManageSubscriptions: false,
      canAccessSystemSettings: false,
      canViewPlatformAnalytics: false,
      canManageBilling: false,
      canAccessSupport: true,
      canViewOwnDeliveries: true,
      canViewOwnInvoices: true,
      canMakePayments: true,
      canDownloadInvoices: true,
      canViewConsumption: true,
      canContactVendor: true,
    },
  };

  return permissions[role] || {};
};

module.exports = {
  getPermissionsByRole,
};

