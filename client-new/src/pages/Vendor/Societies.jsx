import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Societies = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [outstanding, setOutstanding] = useState(null);
  const [societyStats, setSocietyStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    deliveryRate: '',
    pricingType: 'per_liter',
    paymentTerms: 'cash',
    creditLimit: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/societies');
      setSocieties(response.data);
    } catch (error) {
      console.error('Error fetching societies:', error);
      setError(error.response?.data?.message || 'Failed to load societies');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocietyDetails = async (societyId) => {
    try {
      const [societyResponse, deliveriesResponse, outstandingResponse, statsResponse] = await Promise.all([
        api.get(`/societies/${societyId}`),
        api.get(`/societies/${societyId}/deliveries`),
        api.get(`/societies/${societyId}/outstanding`),
        api.get(`/societies/${societyId}/stats`),
      ]);
      setSelectedSociety(societyResponse.data);
      setDeliveryHistory(deliveriesResponse.data);
      setOutstanding(outstandingResponse.data);
      setSocietyStats(statsResponse.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching society details:', error);
      alert(error.response?.data?.message || 'Failed to load society details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const submitData = {
        ...formData,
        deliveryRate: parseFloat(formData.deliveryRate) || 0,
        creditLimit: parseFloat(formData.creditLimit) || 0,
      };
      
      if (selectedSociety) {
        await api.put(`/societies/${selectedSociety._id}`, submitData);
      } else {
        await api.post('/societies', submitData);
      }
      setShowModal(false);
      resetForm();
      fetchSocieties();
    } catch (error) {
      console.error('Error saving society:', error);
      setError(error.response?.data?.message || 'Failed to save society');
    }
  };

  const handleDelete = async (societyId) => {
    if (!window.confirm('Are you sure you want to delete this society?')) return;
    
    try {
      await api.delete(`/societies/${societyId}`);
      fetchSocieties();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete society');
    }
  };

  const handleEdit = (society) => {
    setSelectedSociety(society);
    setFormData({
      name: society.name,
      contactPerson: society.contactPerson || '',
      phone: society.phone,
      email: society.email || '',
      address: {
        street: society.address?.street || '',
        city: society.address?.city || '',
        state: society.address?.state || '',
        zipCode: society.address?.zipCode || '',
      },
      deliveryRate: society.deliveryRate.toString(),
      pricingType: society.pricingType || 'per_liter',
      paymentTerms: society.paymentTerms || 'cash',
      creditLimit: society.creditLimit?.toString() || '0',
      isActive: society.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      deliveryRate: '',
      pricingType: 'per_liter',
      paymentTerms: 'cash',
      creditLimit: '',
      isActive: true,
    });
    setSelectedSociety(null);
    setError('');
  };

  const filteredSocieties = societies.filter(
    (society) =>
      society.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getPaymentTermsLabel = (terms) => {
    const labels = {
      cash: t('vendor.cash'),
      credit_7: t('vendor.credit7Days'),
      credit_15: t('vendor.credit15Days'),
      credit_30: t('vendor.credit30Days'),
    };
    return labels[terms] || terms;
  };

  const getPricingTypeLabel = (type) => {
    return type === 'per_liter' ? t('vendor.perLiter') : t('vendor.fixedRate');
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.societies')}</h1>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.societies')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your customer societies</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          variant="primary"
          className="w-full sm:w-auto"
        >
          {t('vendor.addSociety')}
        </Button>
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
          placeholder="Search societies by name, contact, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      {/* Societies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSocieties.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('vendor.noSocieties')}</p>
              </div>
            </Card>
          </div>
        ) : (
          filteredSocieties.map((society) => (
            <Card key={society._id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{society.name}</h3>
                  {society.contactPerson && (
                    <p className="text-sm text-gray-600">{society.contactPerson}</p>
                  )}
                  <p className="text-sm text-gray-600">{society.phone}</p>
                  {society.email && (
                    <p className="text-sm text-gray-600">{society.email}</p>
                  )}
                  <p className="text-sm text-primary mt-2 font-medium">
                    ₹{society.deliveryRate}/L
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    society.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {society.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              
              <div className="mb-4 text-xs text-gray-600">
                <p>{getPricingTypeLabel(society.pricingType)}</p>
                <p>{getPaymentTermsLabel(society.paymentTerms)}</p>
                {society.creditLimit > 0 && (
                  <p>Credit Limit: {formatCurrency(society.creditLimit)}</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => fetchSocietyDetails(society._id)}
                  className="flex-1"
                >
                  {t('vendor.viewDetails')}
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleEdit(society)}
                  className="flex-1"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => handleDelete(society._id)}
                  className="flex-1"
                >
                  {t('common.delete')}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Society Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedSociety ? t('vendor.editSociety') : t('vendor.addSociety')}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.societyName')}
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label={t('vendor.contactPerson')}
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.phone')}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  label={t('vendor.email')}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.deliveryRate')}
                  type="number"
                  step="0.01"
                  name="deliveryRate"
                  value={formData.deliveryRate}
                  onChange={(e) => setFormData({ ...formData, deliveryRate: e.target.value })}
                  placeholder="5.00"
                  required
                />
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.pricingType')} *
                  </label>
                  <select
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="per_liter">{t('vendor.perLiter')}</option>
                    <option value="fixed_rate">{t('vendor.fixedRate')}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('vendor.paymentTerms')} *
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="cash">{t('vendor.cash')}</option>
                    <option value="credit_7">{t('vendor.credit7Days')}</option>
                    <option value="credit_15">{t('vendor.credit15Days')}</option>
                    <option value="credit_30">{t('vendor.credit30Days')}</option>
                  </select>
                </div>
                <Input
                  label={t('vendor.creditLimit')}
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.street')}
                  name="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value } 
                  })}
                />
                <Input
                  label={t('vendor.city')}
                  name="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value } 
                  })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.state')}
                  name="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value } 
                  })}
                />
                <Input
                  label={t('vendor.zipCode')}
                  name="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value } 
                  })}
                />
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{t('common.active')}</span>
              </label>
              
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.save')}
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

      {/* Society Details Modal */}
      {showDetailsModal && selectedSociety && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedSociety.name}</h2>
              <button
                onClick={() => { 
                  setShowDetailsModal(false); 
                  setSelectedSociety(null); 
                  setDeliveryHistory([]);
                  setOutstanding(null);
                  setSocietyStats(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Society Info */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.societyInfo')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('vendor.societyName')}:</span>
                    <span className="ml-2 font-medium">{selectedSociety.name}</span>
                  </div>
                  {selectedSociety.contactPerson && (
                    <div>
                      <span className="text-gray-600">{t('vendor.contactPerson')}:</span>
                      <span className="ml-2 font-medium">{selectedSociety.contactPerson}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('vendor.phone')}:</span>
                    <span className="ml-2 font-medium">{selectedSociety.phone}</span>
                  </div>
                  {selectedSociety.email && (
                    <div>
                      <span className="text-gray-600">{t('vendor.email')}:</span>
                      <span className="ml-2 font-medium">{selectedSociety.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('vendor.deliveryRate')}:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedSociety.deliveryRate)}/L</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.pricingType')}:</span>
                    <span className="ml-2 font-medium">{getPricingTypeLabel(selectedSociety.pricingType)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.paymentTerms')}:</span>
                    <span className="ml-2 font-medium">{getPaymentTermsLabel(selectedSociety.paymentTerms)}</span>
                  </div>
                  {selectedSociety.creditLimit > 0 && (
                    <div>
                      <span className="text-gray-600">{t('vendor.creditLimit')}:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedSociety.creditLimit)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('common.status')}:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedSociety.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSociety.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              {societyStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t('vendor.monthlyStats')}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.deliveries')}:</span>
                        <span className="font-medium">{societyStats.monthly.deliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.quantity')}:</span>
                        <span className="font-medium">{societyStats.monthly.quantity}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.amount')}:</span>
                        <span className="font-medium">{formatCurrency(societyStats.monthly.amount)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t('vendor.totalDeliveries')}</h3>
                    <p className="text-2xl font-bold text-primary">{societyStats.total.deliveries}</p>
                    <p className="text-sm text-gray-600 mt-1">{societyStats.total.quantity}L total</p>
                  </Card>
                </div>
              )}

              {/* Outstanding Invoices */}
              {outstanding && (
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.outstandingInvoices')}</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.totalInvoiced')}:</span>
                      <span className="font-bold text-gray-800">{formatCurrency(outstanding.totalInvoiced)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.totalPaid')}:</span>
                      <span className="font-bold text-green-600">{formatCurrency(outstanding.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.outstanding')}:</span>
                      <span className="font-bold text-red-600 text-lg">{formatCurrency(outstanding.totalOutstanding)}</span>
                    </div>
                    {outstanding.unbilledAmount > 0 && (
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                        <span className="text-gray-700 font-medium">{t('vendor.unbilledAmount')}:</span>
                        <span className="font-bold text-yellow-600">{formatCurrency(outstanding.unbilledAmount)}</span>
                      </div>
                    )}
                  </div>
                  
                  {outstanding.outstandingInvoices.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">{t('vendor.outstandingInvoicesList')}</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-2 px-2">{t('vendor.invoiceNumber')}</th>
                              <th className="text-left py-2 px-2">{t('vendor.date')}</th>
                              <th className="text-right py-2 px-2">{t('vendor.total')}</th>
                              <th className="text-right py-2 px-2">{t('vendor.outstanding')}</th>
                              <th className="text-left py-2 px-2">{t('common.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outstanding.outstandingInvoices.map((invoice) => (
                              <tr key={invoice._id} className="border-b">
                                <td className="py-2 px-2 font-medium">{invoice.invoiceNumber}</td>
                                <td className="py-2 px-2">{formatDate(invoice.createdAt)}</td>
                                <td className="py-2 px-2 text-right">{formatCurrency(invoice.total)}</td>
                                <td className="py-2 px-2 text-right font-medium text-red-600">{formatCurrency(invoice.outstanding)}</td>
                                <td className="py-2 px-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                    invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {invoice.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {outstanding.unbilledDeliveries.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">{t('vendor.unbilledDeliveries')}</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-2 px-2">{t('vendor.date')}</th>
                              <th className="text-left py-2 px-2">{t('vendor.driver')}</th>
                              <th className="text-left py-2 px-2">{t('vendor.vehicle')}</th>
                              <th className="text-right py-2 px-2">{t('vendor.quantity')}</th>
                              <th className="text-right py-2 px-2">{t('vendor.amount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outstanding.unbilledDeliveries.map((delivery) => (
                              <tr key={delivery._id} className="border-b">
                                <td className="py-2 px-2">{formatDate(delivery.createdAt)}</td>
                                <td className="py-2 px-2">{delivery.driverName || 'N/A'}</td>
                                <td className="py-2 px-2">{delivery.vehicleNumber || 'N/A'}</td>
                                <td className="py-2 px-2 text-right">{delivery.quantity}L</td>
                                <td className="py-2 px-2 text-right font-medium">{formatCurrency(delivery.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Delivery History */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.deliveryHistory')}</h3>
                {deliveryHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('vendor.noDeliveries')}</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-2">{t('vendor.date')}</th>
                          <th className="text-left py-2 px-2">{t('vendor.driver')}</th>
                          <th className="text-left py-2 px-2">{t('vendor.vehicle')}</th>
                          <th className="text-right py-2 px-2">{t('vendor.quantity')}</th>
                          <th className="text-right py-2 px-2">{t('vendor.amount')}</th>
                          <th className="text-left py-2 px-2">{t('common.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveryHistory.map((delivery) => (
                          <tr key={delivery._id} className="border-b">
                            <td className="py-2 px-2">{formatDate(delivery.createdAt)}</td>
                            <td className="py-2 px-2">{delivery.driverId?.name || 'N/A'}</td>
                            <td className="py-2 px-2">{delivery.vehicleId?.vehicleNumber || 'N/A'}</td>
                            <td className="py-2 px-2 text-right">{delivery.quantity}L</td>
                            <td className="py-2 px-2 text-right font-medium">{formatCurrency(delivery.totalAmount)}</td>
                            <td className="py-2 px-2">
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {delivery.status}
                                </span>
                                {delivery.isInvoiced && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                    Invoiced
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleEdit(selectedSociety)}
                className="flex-1"
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { 
                  setShowDetailsModal(false); 
                  setSelectedSociety(null); 
                  setDeliveryHistory([]);
                  setOutstanding(null);
                  setSocietyStats(null);
                }}
                className="flex-1"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Societies;

