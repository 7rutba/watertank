import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Collections = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    supplierId: '',
    startDate: '',
    endDate: '',
  });
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchDrivers();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [filters]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.supplierId) params.append('supplierId', filters.supplierId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/collections?${params.toString()}`);
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      driverId: '',
      supplierId: '',
      startDate: '',
      endDate: '',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openDetailsModal = async (collection) => {
    try {
      const response = await api.get(`/collections/${collection._id}`);
      setSelectedCollection(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching collection details:', error);
    }
  };

  if (loading && collections.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.collections')}</h1>
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.collections')}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">View all water collection records</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.driver')}</label>
            <select
              name="driverId"
              value={filters.driverId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>{driver.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.supplierName')}</label>
            <select
              name="supplierId"
              value={filters.supplierId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')}</label>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')}</label>
            <div className="flex gap-2">
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mb-0 flex-1"
              />
              <Button variant="outline" size="small" onClick={clearFilters} className="whitespace-nowrap">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalCollections')}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{collections.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalQuantity')}</div>
          <div className="text-2xl font-bold text-primary mt-1">
            {collections.reduce((sum, c) => sum + (c.quantity || 0), 0)}L
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalAmount')}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(collections.reduce((sum, c) => sum + (c.totalAmount || 0), 0))}
          </div>
        </Card>
      </div>

      {/* Collections Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.driver')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.supplierName')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.vehicle')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.quantity')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.rate')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {t('vendor.noCollections')}
                  </td>
                </tr>
              ) : (
                collections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(collection.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {collection.driverId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {collection.supplierId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {collection.vehicleId?.vehicleNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {collection.quantity}L
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(collection.purchaseRate || 0)}/L
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(collection.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        collection.status === 'completed' ? 'bg-green-100 text-green-800' :
                        collection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {collection.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => openDetailsModal(collection)}
                      >
                        {t('vendor.viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Collection Details Modal */}
      {showDetailsModal && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('vendor.collectionDetails')}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedCollection(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('vendor.date')}:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedCollection.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedCollection.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedCollection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedCollection.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.driver')}:</span>
                  <span className="ml-2 font-medium">{selectedCollection.driverId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.vehicle')}:</span>
                  <span className="ml-2 font-medium">{selectedCollection.vehicleId?.vehicleNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.supplierName')}:</span>
                  <span className="ml-2 font-medium">{selectedCollection.supplierId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.quantity')}:</span>
                  <span className="ml-2 font-medium">{selectedCollection.quantity}L</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.rate')}:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedCollection.purchaseRate || 0)}/L</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.amount')}:</span>
                  <span className="ml-2 font-medium text-lg text-primary">{formatCurrency(selectedCollection.totalAmount || 0)}</span>
                </div>
              </div>
              
              {selectedCollection.location && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.location')}:</span>
                  <div className="mt-1 text-sm">
                    {selectedCollection.location.latitude}, {selectedCollection.location.longitude}
                  </div>
                </div>
              )}
              
              {selectedCollection.notes && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.notes')}:</span>
                  <div className="mt-1 text-sm text-gray-800">{selectedCollection.notes}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedCollection(null); }}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;

