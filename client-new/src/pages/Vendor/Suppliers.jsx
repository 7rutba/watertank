import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Suppliers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [outstanding, setOutstanding] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);
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
    purchaseRate: '',
    paymentTerms: 'cash',
    creditLimit: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError(error.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetails = async (supplierId) => {
    try {
      const [supplierResponse, paymentsResponse, outstandingResponse, statsResponse] = await Promise.all([
        api.get(`/suppliers/${supplierId}`),
        api.get(`/suppliers/${supplierId}/payments`),
        api.get(`/suppliers/${supplierId}/outstanding`),
        api.get(`/suppliers/${supplierId}/stats`),
      ]);
      setSelectedSupplier(supplierResponse.data);
      setPaymentHistory(paymentsResponse.data);
      setOutstanding(outstandingResponse.data);
      setSupplierStats(statsResponse.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      alert(error.response?.data?.message || 'Failed to load supplier details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const submitData = {
        ...formData,
        purchaseRate: parseFloat(formData.purchaseRate) || 0,
        creditLimit: parseFloat(formData.creditLimit) || 0,
      };
      
      if (selectedSupplier) {
        await api.put(`/suppliers/${selectedSupplier._id}`, submitData);
      } else {
        await api.post('/suppliers', submitData);
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setError(error.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      await api.delete(`/suppliers/${supplierId}`);
      fetchSuppliers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: {
        street: supplier.address?.street || '',
        city: supplier.address?.city || '',
        state: supplier.address?.state || '',
        zipCode: supplier.address?.zipCode || '',
      },
      purchaseRate: supplier.purchaseRate.toString(),
      paymentTerms: supplier.paymentTerms || 'cash',
      creditLimit: supplier.creditLimit?.toString() || '0',
      isActive: supplier.isActive,
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
      purchaseRate: '',
      paymentTerms: 'cash',
      creditLimit: '',
      isActive: true,
    });
    setSelectedSupplier(null);
    setError('');
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      per_collection: t('vendor.perCollection'),
    };
    return labels[terms] || terms;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.suppliers')}</h1>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.suppliers')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your water suppliers</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          variant="primary"
          className="w-full sm:w-auto"
        >
          {t('vendor.addSupplier')}
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
          placeholder="Search suppliers by name, contact, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('vendor.noSuppliers')}</p>
              </div>
            </Card>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card key={supplier._id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{supplier.name}</h3>
                  {supplier.contactPerson && (
                    <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                  )}
                  <p className="text-sm text-gray-600">{supplier.phone}</p>
                  {supplier.email && (
                    <p className="text-sm text-gray-600">{supplier.email}</p>
                  )}
                  <p className="text-sm text-primary mt-2 font-medium">
                    ₹{supplier.purchaseRate}/Tanker
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    supplier.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {supplier.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              
              <div className="mb-4 text-xs text-gray-600">
                <p>{getPaymentTermsLabel(supplier.paymentTerms)}</p>
                {supplier.creditLimit > 0 && (
                  <p>Credit Limit: {formatCurrency(supplier.creditLimit)}</p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => fetchSupplierDetails(supplier._id)}
                  className="flex-1"
                >
                  {t('vendor.viewDetails')}
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleEdit(supplier)}
                  className="flex-1"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => handleDelete(supplier._id)}
                  className="flex-1"
                >
                  {t('common.delete')}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedSupplier ? t('vendor.editSupplier') : t('vendor.addSupplier')}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('vendor.supplierName')}
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
                  label={`${t('vendor.purchaseRate')} (per Tanker)`}
                  type="number"
                  step="0.01"
                  name="purchaseRate"
                  value={formData.purchaseRate}
                  onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
                  placeholder="2500"
                  required
                />
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
                    <option value="per_collection">{t('vendor.perCollection')}</option>
                  </select>
                </div>
              </div>
              
              <Input
                label={t('vendor.creditLimit')}
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                placeholder="0"
              />
              
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

      {/* Supplier Details Modal */}
      {showDetailsModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedSupplier.name}</h2>
              <button
                onClick={() => { 
                  setShowDetailsModal(false); 
                  setSelectedSupplier(null); 
                  setPaymentHistory([]);
                  setOutstanding(null);
                  setSupplierStats(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Supplier Info */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.supplierInfo')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('vendor.supplierName')}:</span>
                    <span className="ml-2 font-medium">{selectedSupplier.name}</span>
                  </div>
                  {selectedSupplier.contactPerson && (
                    <div>
                      <span className="text-gray-600">{t('vendor.contactPerson')}:</span>
                      <span className="ml-2 font-medium">{selectedSupplier.contactPerson}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('vendor.phone')}:</span>
                    <span className="ml-2 font-medium">{selectedSupplier.phone}</span>
                  </div>
                  {selectedSupplier.email && (
                    <div>
                      <span className="text-gray-600">{t('vendor.email')}:</span>
                      <span className="ml-2 font-medium">{selectedSupplier.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('vendor.purchaseRate')}:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedSupplier.purchaseRate)}/Tanker</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.paymentTerms')}:</span>
                    <span className="ml-2 font-medium">{getPaymentTermsLabel(selectedSupplier.paymentTerms)}</span>
                  </div>
                  {selectedSupplier.creditLimit > 0 && (
                    <div>
                      <span className="text-gray-600">{t('vendor.creditLimit')}:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedSupplier.creditLimit)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('common.status')}:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedSupplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSupplier.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              {supplierStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t('vendor.monthlyStats')}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.collections')}:</span>
                        <span className="font-medium">{supplierStats.monthly.collections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.quantity')}:</span>
                        <span className="font-medium">{supplierStats.monthly.quantity}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.amount')}:</span>
                        <span className="font-medium">{formatCurrency(supplierStats.monthly.amount)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t('vendor.totalCollections')}</h3>
                    <p className="text-2xl font-bold text-primary">{supplierStats.totalCollections}</p>
                  </Card>
                </div>
              )}

              {/* Outstanding Payments */}
              {outstanding && (
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.outstandingPayments')}</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.totalCollections')}:</span>
                      <span className="font-bold text-gray-800">{formatCurrency(outstanding.totalCollections)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.totalPaid')}:</span>
                      <span className="font-bold text-green-600">{formatCurrency(outstanding.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-gray-700 font-medium">{t('vendor.outstanding')}:</span>
                      <span className="font-bold text-red-600 text-lg">{formatCurrency(outstanding.outstanding)}</span>
                    </div>
                  </div>
                  
                  {outstanding.unpaidCollections.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">{t('vendor.unpaidCollections')}</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-2 px-2">{t('vendor.date')}</th>
                              <th className="text-left py-2 px-2">{t('vendor.quantity')}</th>
                              <th className="text-right py-2 px-2">{t('vendor.amount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outstanding.unpaidCollections.map((collection) => (
                              <tr key={collection._id} className="border-b">
                                <td className="py-2 px-2">{formatDate(collection.createdAt)}</td>
                                <td className="py-2 px-2">{collection.quantity}L</td>
                                <td className="py-2 px-2 text-right font-medium">{formatCurrency(collection.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Payment History */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.paymentHistory')}</h3>
                {paymentHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('vendor.noPayments')}</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-2">{t('vendor.date')}</th>
                          <th className="text-right py-2 px-2">{t('vendor.amount')}</th>
                          <th className="text-left py-2 px-2">{t('vendor.method')}</th>
                          <th className="text-left py-2 px-2">{t('common.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment._id} className="border-b">
                            <td className="py-2 px-2">{formatDate(payment.paymentDate)}</td>
                            <td className="py-2 px-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="py-2 px-2 capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </span>
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
                onClick={() => handleEdit(selectedSupplier)}
                className="flex-1"
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { 
                  setShowDetailsModal(false); 
                  setSelectedSupplier(null); 
                  setPaymentHistory([]);
                  setOutstanding(null);
                  setSupplierStats(null);
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

export default Suppliers;

