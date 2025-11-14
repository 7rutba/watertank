import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Vendors = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    },
    subscription: {
      plan: 'basic',
      isActive: true,
    },
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(t('common.error') || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith('subscription.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        subscription: { ...prev.subscription, [field]: field === 'isActive' ? checked : value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, formData);
        setSuccess(t('common.updateSuccess') || 'Vendor updated successfully');
      } else {
        await api.post('/vendors', formData);
        setSuccess(t('common.addSuccess') || 'Vendor created successfully');
      }
      fetchVendors();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || t('common.error') || 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setFormData({
      businessName: vendor.businessName || '',
      ownerName: vendor.ownerName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      subscription: vendor.subscription || {
        plan: 'basic',
        isActive: true,
      },
      isActive: vendor.isActive !== undefined ? vendor.isActive : true,
    });
    setEditingId(vendor._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      setSuccess(t('common.deleteSuccess') || 'Vendor deleted successfully');
      fetchVendors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || t('common.error') || 'Failed to delete');
    }
  };

  const toggleVendorStatus = async (id, currentStatus) => {
    try {
      await api.put(`/vendors/${id}`, { isActive: !currentStatus });
      setSuccess(t('common.updateSuccess') || 'Status updated');
      fetchVendors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || t('common.error') || 'Failed to update');
    }
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', zipCode: '' },
      subscription: { plan: 'basic', isActive: true },
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && vendor.isActive) ||
      (filterStatus === 'inactive' && !vendor.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('admin.vendors') || 'Vendor Management'}</h1>
          <p className="text-gray-600 mt-1">{t('admin.manageAllVendors') || 'Manage all vendors on the platform'}</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : '➕ ' + (t('admin.addVendor') || 'Add Vendor')}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingId ? t('common.edit') : t('admin.addVendor') || 'Add Vendor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                name="businessName"
                label={`${t('admin.businessName') || 'Business Name'} *`}
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                name="ownerName"
                label={`${t('admin.ownerName') || 'Owner Name'} *`}
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                name="email"
                label={`${t('auth.email')} *`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="tel"
                name="phone"
                label={`${t('auth.phone')} *`}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t('common.address')}</label>
              <Input
                type="text"
                name="address.street"
                placeholder={t('common.street')}
                value={formData.address.street}
                onChange={handleChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  name="address.city"
                  placeholder={t('common.city')}
                  value={formData.address.city}
                  onChange={handleChange}
                />
                <Input
                  type="text"
                  name="address.state"
                  placeholder={t('common.state')}
                  value={formData.address.state}
                  onChange={handleChange}
                />
                <Input
                  type="text"
                  name="address.zipCode"
                  placeholder={t('common.zipCode')}
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.subscriptionPlan') || 'Subscription Plan'}
                </label>
                <select
                  name="subscription.plan"
                  value={formData.subscription.plan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">{t('admin.basic') || 'Basic'}</option>
                  <option value="premium">{t('admin.premium') || 'Premium'}</option>
                  <option value="enterprise">{t('admin.enterprise') || 'Enterprise'}</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="subscription.isActive"
                    checked={formData.subscription.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('admin.subscriptionActive') || 'Subscription Active'}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t('common.active')}</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary">
                {editingId ? t('common.save') : t('common.add')}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder={t('common.search') || 'Search vendors...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">{t('common.all')}</option>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <p className="text-center py-8 text-gray-500">{t('common.noData')}</p>
            </Card>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">{vendor.businessName}</h3>
                  <p className="text-sm text-gray-600">{vendor.ownerName}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vendor.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {vendor.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vendor.subscription?.plan === 'premium'
                      ? 'bg-blue-100 text-blue-700'
                      : vendor.subscription?.plan === 'enterprise'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {vendor.subscription?.plan || 'Basic'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">{t('auth.email')}:</strong> {vendor.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">{t('auth.phone')}:</strong> {vendor.phone}
                </p>
                {vendor.address && (
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">{t('common.address')}:</strong> {vendor.address.street}, {vendor.address.city}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">{t('admin.subscriptions')}:</strong> {vendor.subscription?.isActive ? t('common.active') : t('common.inactive')}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant={vendor.isActive ? 'warning' : 'success'}
                  size="small"
                  onClick={() => toggleVendorStatus(vendor._id, vendor.isActive)}
                  className="w-full"
                >
                  {vendor.isActive ? t('common.deactivate') || 'Deactivate' : t('common.activate') || 'Activate'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="info" size="small" onClick={() => handleEdit(vendor)} className="flex-1">
                    {t('common.edit')}
                  </Button>
                  <Button variant="danger" size="small" onClick={() => handleDelete(vendor._id)} className="flex-1">
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Vendors;

