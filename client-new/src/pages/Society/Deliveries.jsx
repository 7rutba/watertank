import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Deliveries = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [deliveries, filters]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deliveries/society/my-deliveries');
      setDeliveries(response.data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveries];

    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= endDate);
    }

    setFilteredDeliveries(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  const openDetailsModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedDelivery(null);
    setShowDetailsModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('society.deliveries')}</h1>
        <p className="text-gray-600 mt-1">{t('society.viewAllDeliveries')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('common.filter')}</h2>
          <Button
            variant="outline"
            size="small"
            onClick={resetFilters}
          >
            {t('common.reset')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label={t('driver.startDate')}
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Input
              label={t('driver.endDate')}
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.status')}
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{t('driver.all')}</option>
              <option value="pending">{t('driver.pending')}</option>
              <option value="completed">{t('driver.completed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalDeliveries')}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{filteredDeliveries.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalQuantity')}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {filteredDeliveries.reduce((sum, d) => sum + (d.quantity || 0), 0)}L
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalAmount')}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatCurrency(filteredDeliveries.reduce((sum, d) => sum + (d.totalAmount || 0), 0))}
          </p>
        </div>
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">{t('society.noDeliveries')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.quantity')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.vehicle')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.driver')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.totalAmount')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{formatDate(delivery.createdAt)}</div>
                        <div className="text-gray-500">{formatTime(delivery.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {delivery.quantity}L
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {delivery.vehicleId?.vehicleNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {delivery.driverId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(delivery.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          delivery.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => openDetailsModal(delivery)}
                      >
                        {t('vendor.viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('society.deliveryDetails')}</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('driver.date')}:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(selectedDelivery.createdAt)} {formatTime(selectedDelivery.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.quantity')}:</span>
                  <span className="ml-2 font-medium">{selectedDelivery.quantity}L</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.deliveryRate')}:</span>
                  <span className="ml-2 font-medium">₹{selectedDelivery.deliveryRate}/L</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.totalAmount')}:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedDelivery.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.vehicle')}:</span>
                  <span className="ml-2 font-medium">
                    {selectedDelivery.vehicleId?.vehicleNumber || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.driver')}:</span>
                  <span className="ml-2 font-medium">
                    {selectedDelivery.driverId?.name || 'N/A'}
                  </span>
                </div>
                {selectedDelivery.signedBy && (
                  <div>
                    <span className="text-gray-600">{t('driver.signedBy')}:</span>
                    <span className="ml-2 font-medium">{selectedDelivery.signedBy}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedDelivery.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedDelivery.status}
                  </span>
                </div>
              </div>

              {selectedDelivery.location && (
                <div>
                  <span className="text-gray-600">{t('driver.location')}:</span>
                  <p className="mt-1 text-sm">
                    Lat: {selectedDelivery.location.latitude?.toFixed(6)}, 
                    Long: {selectedDelivery.location.longitude?.toFixed(6)}
                  </p>
                </div>
              )}

              {selectedDelivery.notes && (
                <div>
                  <span className="text-gray-600">{t('driver.notes')}:</span>
                  <p className="mt-1 text-sm">{selectedDelivery.notes}</p>
                </div>
              )}

              {selectedDelivery.meterPhoto && (
                <div>
                  <span className="text-gray-600">{t('driver.meterPhoto')}:</span>
                  <img
                    src={selectedDelivery.meterPhoto}
                    alt="Meter"
                    className="mt-2 max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {selectedDelivery.signature && (
                <div>
                  <span className="text-gray-600">{t('driver.signature')}:</span>
                  <img
                    src={selectedDelivery.signature}
                    alt="Signature"
                    className="mt-2 max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={closeDetailsModal}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;

