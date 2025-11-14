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
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

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
      await api.post('/vendors', formData);
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      console.error('Error creating vendor:', error);
      setError(error.response?.data?.message || 'Failed to create vendor');
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
    });
    setError('');
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
                      <div className="flex gap-1 sm:gap-2">
                        {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_EDIT_VENDORS) && (
                          <Button size="small" variant="outline" className="text-xs px-2">
                            {t('common.edit')}
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
    </div>
  );
};

export default Vendors;

