import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Deliveries = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    societyId: '',
    isInvoiced: '',
    startDate: '',
    endDate: '',
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
    fetchSocieties();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.societyId) params.append('societyId', filters.societyId);
      if (filters.isInvoiced !== '') params.append('isInvoiced', filters.isInvoiced);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/deliveries?${params.toString()}`);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
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

  const fetchSocieties = async () => {
    try {
      const response = await api.get('/societies');
      setSocieties(response.data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      driverId: '',
      societyId: '',
      isInvoiced: '',
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

  const formatTankerCount = (qty, vehicle) => {
    const cap = Number(vehicle?.capacity) || 0;
    const q = Number(qty) || 0;
    if (!cap || !q) return '-';
    const count = q / cap;
    return Number.isInteger(count) ? `${count} Tanker${count === 1 ? '' : 's'}` : `${count.toFixed(2)} Tankers`;
  };

  const perTankerRate = (perLiter, vehicle) => {
    const cap = Number(vehicle?.capacity) || 0;
    const rate = Number(perLiter) || 0;
    if (!cap || !rate) return 0;
    return cap * rate;
  };

  const openDetailsModal = async (delivery) => {
    try {
      const response = await api.get(`/deliveries/${delivery._id}`);
      setSelectedDelivery(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching delivery details:', error);
    }
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.deliveries')}</h1>
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.deliveries')}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">View all water delivery records</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.societyName')}</label>
            <select
              name="societyId"
              value={filters.societyId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Societies</option>
              {societies.map(society => (
                <option key={society._id} value={society._id}>{society.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Invoiced</label>
            <select
              name="isInvoiced"
              value={filters.isInvoiced}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All</option>
              <option value="true">Invoiced</option>
              <option value="false">Not Invoiced</option>
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
            <Input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <Button 
              variant="outline" 
              size="small" 
              onClick={clearFilters} 
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalDeliveries')}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{deliveries.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Total Tankers</div>
          <div className="text-2xl font-bold text-primary mt-1">
            {deliveries.reduce((sum, d) => {
              const cap = Number(d?.vehicleId?.capacity) || 0;
              const q = Number(d?.quantity) || 0;
              return sum + (cap ? q / cap : 0);
            }, 0).toFixed(2)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalAmount')}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(deliveries.reduce((sum, d) => sum + (d.totalAmount || 0), 0))}
          </div>
        </Card>
      </div>

      {/* Deliveries Table - Desktop View */}
      <Card className="overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.driver')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.societyName')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.vehicle')}</th>
                <th className="px-3 xl:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tankers</th>
                <th className="px-3 xl:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-3 xl:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.amount')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {t('vendor.noDeliveries')}
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{formatDate(delivery.createdAt)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{delivery.driverId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-[150px] truncate">{delivery.societyId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{delivery.vehicleId?.vehicleNumber || 'N/A'}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900 text-right">
                      <div className="whitespace-nowrap">{formatTankerCount(delivery.quantity, delivery?.vehicleId)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900 text-right">
                      <div className="whitespace-nowrap">{formatCurrency(perTankerRate(delivery.deliveryRate || 0, delivery?.vehicleId))}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      <div className="whitespace-nowrap">{formatCurrency(delivery.totalAmount || 0)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                          delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {delivery.status}
                        </span>
                        {delivery.isInvoiced && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                            Invoiced
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => openDetailsModal(delivery)}
                        className="text-xs"
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

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden">
          {deliveries.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              {t('vendor.noDeliveries')}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {delivery.societyId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(delivery.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status}
                      </span>
                      {delivery.isInvoiced && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          Invoiced
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.driver')}:</span>
                      <div className="font-medium text-gray-900">{delivery.driverId?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.vehicle')}:</span>
                      <div className="font-medium text-gray-900">{delivery.vehicleId?.vehicleNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Tankers:</span>
                      <div className="font-medium text-gray-900">{formatTankerCount(delivery.quantity, delivery?.vehicleId)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Rate:</span>
                      <div className="font-medium text-gray-900">{formatCurrency(perTankerRate(delivery.deliveryRate || 0, delivery?.vehicleId))}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-xs text-gray-600">{t('vendor.amount')}:</span>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(delivery.totalAmount || 0)}
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => openDetailsModal(delivery)}
                      className="text-xs"
                    >
                      {t('vendor.viewDetails')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Delivery Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t('vendor.deliveryDetails')}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedDelivery(null); }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 block mb-1">{t('vendor.date')}:</span>
                  <span className="font-medium">{formatDate(selectedDelivery.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">{t('common.status')}:</span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedDelivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedDelivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedDelivery.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">{t('vendor.driver')}:</span>
                  <span className="font-medium">{selectedDelivery.driverId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">{t('vendor.vehicle')}:</span>
                  <span className="font-medium">{selectedDelivery.vehicleId?.vehicleNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">{t('vendor.societyName')}:</span>
                  <span className="font-medium">{selectedDelivery.societyId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Tankers:</span>
                  <span className="font-medium">{formatTankerCount(selectedDelivery.quantity, selectedDelivery?.vehicleId)}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Rate:</span>
                  <span className="font-medium">{formatCurrency(perTankerRate(selectedDelivery.deliveryRate || 0, selectedDelivery?.vehicleId))}/Tanker</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">{t('vendor.amount')}:</span>
                  <span className="font-medium text-lg text-primary">{formatCurrency(selectedDelivery.totalAmount || 0)}</span>
                </div>
                {selectedDelivery.signedBy && (
                  <div>
                    <span className="text-gray-600 block mb-1">Signed By:</span>
                    <span className="font-medium">{selectedDelivery.signedBy}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 block mb-1">Invoiced:</span>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedDelivery.isInvoiced ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDelivery.isInvoiced ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              {selectedDelivery.location && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.location')}:</span>
                  <div className="mt-1 text-sm">
                    {selectedDelivery.location.latitude}, {selectedDelivery.location.longitude}
                  </div>
                </div>
              )}
              
              {selectedDelivery.notes && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.notes')}:</span>
                  <div className="mt-1 text-sm text-gray-800">{selectedDelivery.notes}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => { setShowDetailsModal(false); setSelectedDelivery(null); }}
                className="w-full sm:w-auto"
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

export default Deliveries;

