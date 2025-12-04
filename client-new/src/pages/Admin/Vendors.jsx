import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import usePermissions from '../../hooks/usePermissions';
import { SUPER_ADMIN_PERMISSIONS } from '../../utils/permissions';
import api from '../../utils/api';

const Vendors = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    gstNumber: '',
    panNumber: '',
    subscriptionPlanId: '',
    billingCycle: 'monthly',
    generatePassword: true,
    password: '',
  });
  const [error, setError] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    vendorId: '',
    generatePassword: true,
    password: '',
  });
  const [resetPasswordCredentials, setResetPasswordCredentials] = useState(null);

  useEffect(() => {
    fetchVendors();
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await api.get('/admin/subscriptions/plans');
      setSubscriptionPlans(response.data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setCreatedCredentials(null);
      
      const payload = {
        ...formData,
        password: formData.generatePassword ? undefined : formData.password,
      };
      
      const response = await api.post('/vendors', payload);
      
      // Show credentials modal
      if (response.data.credentials) {
        setCreatedCredentials(response.data.credentials);
      } else {
        setShowModal(false);
        resetForm();
        fetchVendors();
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      setError(error.response?.data?.message || 'Failed to create vendor');
    }
  };

  const handleCloseCredentials = () => {
    setCreatedCredentials(null);
    setShowModal(false);
    resetForm();
    fetchVendors();
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      businessName: vendor.businessName || '',
      ownerName: vendor.ownerName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: {
        street: vendor.address?.street || '',
        city: vendor.address?.city || '',
        state: vendor.address?.state || '',
        zipCode: vendor.address?.zipCode || '',
        country: vendor.address?.country || 'India',
      },
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      subscriptionPlanId: vendor.subscription?.planId?._id || vendor.subscription?.planId || '',
      billingCycle: 'monthly', // Default, can be updated if needed
      generatePassword: true,
      password: '',
    });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const payload = {
        ...formData,
        password: undefined, // Don't update password in edit
        generatePassword: undefined,
      };
      
      await api.put(`/vendors/${editingVendor._id}`, payload);
      setShowEditModal(false);
      setEditingVendor(null);
      resetForm();
      fetchVendors();
      // Show success message
      alert('Vendor updated successfully!');
    } catch (error) {
      console.error('Error updating vendor:', error);
      setError(error.response?.data?.message || 'Failed to update vendor');
    }
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await api.delete(`/vendors/${vendorId}`);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
      },
      gstNumber: '',
      panNumber: '',
      subscriptionPlanId: '',
      billingCycle: 'monthly',
      generatePassword: true,
      password: '',
    });
    setError('');
    setCreatedCredentials(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.manageVendors')}</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.manageVendors')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all vendors on the platform</p>
        </div>
        {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_CREATE_VENDORS) && (
          <Button 
            onClick={() => { resetForm(); setShowModal(true); }} 
            variant="primary"
            className="w-full sm:w-auto"
          >
            {t('admin.createVendor')}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <Input
          type="text"
          placeholder="Search vendors by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      {/* Vendors Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  {t('admin.businessName')}
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                  {t('admin.contactEmail')}
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">
                  {t('admin.contactPhone')}
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  {t('admin.status')}
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                  {t('admin.subscriptionPlan')}
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {t('admin.noVendors')}
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-medium text-sm sm:text-base text-gray-800">{vendor.businessName}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{vendor.ownerName}</div>
                      {vendor.vendorId && (
                        <div className="text-xs text-gray-400 mt-1">ID: {vendor.vendorId}</div>
                      )}
                      <div className="text-xs text-gray-500 md:hidden mt-1">{vendor.email}</div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 text-sm hidden md:table-cell">{vendor.email}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 text-sm hidden lg:table-cell">{vendor.phone}</td>
                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          vendor.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vendor.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 text-sm capitalize hidden md:table-cell">
                      {vendor.subscription?.plan || 'basic'}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_EDIT_VENDORS) && (
                          <Button 
                            size="small" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => handleEdit(vendor)}
                          >
                            {t('common.edit')}
                          </Button>
                        )}
                        {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_EDIT_VENDORS) && (
                          <Button 
                            size="small" 
                            variant="outline" 
                            className="text-xs px-2"
                            onClick={() => {
                              setResetPasswordData({
                                vendorId: vendor._id,
                                generatePassword: true,
                                password: '',
                              });
                              setResetPasswordCredentials(null);
                              setShowResetPasswordModal(true);
                            }}
                          >
                            Reset Password
                          </Button>
                        )}
                        {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_DELETE_VENDORS) && (
                          <Button 
                            size="small" 
                            variant="danger" 
                            className="text-xs px-2"
                            onClick={() => handleDelete(vendor._id)}
                          >
                            {t('common.delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.createVendor')}</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.businessName')}
                  name="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
                <Input
                  label={t('admin.vendorName')}
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.contactEmail')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label={t('admin.contactPhone')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GST Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
                <Input
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Street"
                  name="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value } 
                  })}
                />
                <Input
                  label="City"
                  name="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value } 
                  })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="State"
                  name="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value } 
                  })}
                />
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value } 
                  })}
                />
                <Input
                  label="Country"
                  name="country"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value } 
                  })}
                />
              </div>
              
              {/* Subscription Plan Selection */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Subscription Plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Select Plan
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.subscriptionPlanId}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                    >
                      <option value="">Default Plan (Auto-select)</option>
                      {subscriptionPlans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.displayName || plan.name} - ₹{plan.price}/{plan.billingCycle || 'month'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password Options */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Password Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generatePassword}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        generatePassword: e.target.checked,
                        password: e.target.checked ? '' : formData.password
                      })}
                      className="mr-2 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Generate secure random password automatically</span>
                  </label>
                  {!formData.generatePassword && (
                    <div className="space-y-2">
                      <Input
                        label="Set Custom Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!formData.generatePassword}
                        placeholder="Enter password (minimum 6 characters)"
                        className="mb-0"
                      />
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Password requirements:</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                            At least 6 characters {formData.password.length >= 6 ? '✓' : ''}
                          </li>
                          <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                            Recommended: 8+ characters for better security {formData.password.length >= 8 ? '✓' : ''}
                          </li>
                        </ul>
                        {formData.password && formData.password.length < 6 && (
                          <p className="text-red-600 mt-1">Password must be at least 6 characters long</p>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.generatePassword && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        A secure random password will be generated and displayed after vendor creation. 
                        Make sure to save it as it won't be shown again.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.editVendor')}</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.businessName')}
                  name="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
                <Input
                  label={t('admin.vendorName')}
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.contactEmail')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label={t('admin.contactPhone')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GST Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
                <Input
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Street"
                  name="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value } 
                  })}
                />
                <Input
                  label="City"
                  name="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value } 
                  })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="State"
                  name="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value } 
                  })}
                />
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value } 
                  })}
                />
                <Input
                  label="Country"
                  name="country"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value } 
                  })}
                />
              </div>
              
              {/* Subscription Plan Selection */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Subscription Plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Select Plan
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.subscriptionPlanId}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                    >
                      <option value="">Keep Current Plan</option>
                      {subscriptionPlans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.displayName || plan.name} - ₹{plan.price}/{plan.billingCycle || 'month'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                {editingVendor.vendorId && (
                  <div className="mt-2 text-xs text-gray-500">
                    Current Vendor ID: <span className="font-mono">{editingVendor.vendorId}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { 
                    setShowEditModal(false); 
                    setEditingVendor(null);
                    resetForm(); 
                  }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-auto">
            {!resetPasswordCredentials ? (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Reset Vendor Password</h2>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setError('');
                    const payload = {
                      password: resetPasswordData.generatePassword ? undefined : resetPasswordData.password,
                      generatePassword: resetPasswordData.generatePassword,
                    };
                    const response = await api.put(`/vendors/${resetPasswordData.vendorId}/reset-password`, payload);
                    setResetPasswordCredentials(response.data.credentials);
                  } catch (error) {
                    console.error('Error resetting password:', error);
                    setError(error.response?.data?.message || 'Failed to reset password');
                  }
                }} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resetPasswordData.generatePassword}
                        onChange={(e) => setResetPasswordData({ 
                          ...resetPasswordData, 
                          generatePassword: e.target.checked,
                          password: e.target.checked ? '' : resetPasswordData.password
                        })}
                        className="mr-2 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Generate secure random password automatically</span>
                    </label>
                    {!resetPasswordData.generatePassword && (
                      <div className="space-y-2">
                        <Input
                          label="Set Custom Password"
                          type="password"
                          name="password"
                          value={resetPasswordData.password}
                          onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                          required={!resetPasswordData.generatePassword}
                          placeholder="Enter password (minimum 6 characters)"
                          className="mb-0"
                        />
                        <div className="text-xs text-gray-500">
                          {resetPasswordData.password && resetPasswordData.password.length < 6 && (
                            <p className="text-red-600">Password must be at least 6 characters long</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="primary" className="flex-1" disabled={!resetPasswordData.generatePassword && resetPasswordData.password.length < 6}>
                      Reset Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResetPasswordModal(false);
                        setResetPasswordData({ vendorId: '', generatePassword: true, password: '' });
                        setResetPasswordCredentials(null);
                        setError('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Password Reset Successfully!</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 mb-2">
                    Please save these credentials. They will not be shown again.
                  </p>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded border">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-800">{resetPasswordCredentials.email}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resetPasswordCredentials.email);
                          alert('Email copied!');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">New Password</label>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-800">{resetPasswordCredentials.password}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resetPasswordCredentials.password);
                          alert('Password copied!');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setResetPasswordData({ vendorId: '', generatePassword: true, password: '' });
                      setResetPasswordCredentials(null);
                      setError('');
                    }}
                    className="flex-1"
                  >
                    Done
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `Email: ${resetPasswordCredentials.email}\nPassword: ${resetPasswordCredentials.password}`;
                      navigator.clipboard.writeText(text);
                      alert('Credentials copied to clipboard!');
                    }}
                    className="flex-1"
                  >
                    Copy All
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Credentials Display Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Created Successfully!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 mb-2">
                Please save these credentials. They will not be shown again.
              </p>
            </div>
            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 p-3 rounded border">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Vendor ID</label>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800">{createdCredentials.vendorId}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.vendorId);
                      alert('Vendor ID copied!');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800">{createdCredentials.email}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.email);
                      alert('Email copied!');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Password</label>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800">{createdCredentials.password}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.password);
                      alert('Password copied!');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCloseCredentials}
                className="flex-1"
              >
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const text = `Vendor ID: ${createdCredentials.vendorId}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                  navigator.clipboard.writeText(text);
                  alert('All credentials copied to clipboard!');
                }}
                className="flex-1"
              >
                Copy All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;

