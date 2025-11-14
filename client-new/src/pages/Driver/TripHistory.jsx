import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

const TripHistory = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
  });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, filters]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const [collectionsResponse, deliveriesResponse] = await Promise.all([
        api.get('/collections'),
        api.get('/deliveries'),
      ]);

      const allTrips = [];

      collectionsResponse.data.forEach((c) => {
        allTrips.push({
          id: c._id,
          type: 'collection',
          date: c.createdAt,
          location: c.location,
          quantity: c.quantity,
          amount: c.totalAmount,
          status: c.status,
          supplier: c.supplierId?.name,
          vehicle: c.vehicleId?.vehicleNumber,
          purchaseRate: c.purchaseRate,
          notes: c.notes,
          meterPhoto: c.meterPhoto,
          data: c,
        });
      });

      deliveriesResponse.data.forEach((d) => {
        allTrips.push({
          id: d._id,
          type: 'delivery',
          date: d.createdAt,
          location: d.location,
          quantity: d.quantity,
          amount: d.totalAmount,
          status: d.status,
          society: d.societyId?.name,
          vehicle: d.vehicleId?.vehicleNumber,
          deliveryRate: d.deliveryRate,
          signedBy: d.signedBy,
          notes: d.notes,
          meterPhoto: d.meterPhoto,
          signature: d.signature,
          data: d,
        });
      });

      allTrips.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTrips(allTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(trip => trip.type === filters.type);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(trip => new Date(trip.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(trip => new Date(trip.date) <= endDate);
    }

    setFilteredTrips(filtered);
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
      type: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const openDetailsModal = (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedTrip(null);
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('driver.tripHistory')}</h1>
        <p className="text-gray-600 mt-1">{t('driver.viewAllTrips')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('driver.filterByType')}</h2>
          <Button
            variant="outline"
            size="small"
            onClick={resetFilters}
          >
            {t('common.reset')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('driver.type')}
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('driver.all')}</option>
              <option value="collection">{t('driver.collections')}</option>
              <option value="delivery">{t('driver.deliveries')}</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <Input
              label={t('driver.startDate')}
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          {/* End Date */}
          <div>
            <Input
              label={t('driver.endDate')}
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">{t('driver.noTripsFound')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => openDetailsModal(trip)}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">
                    {trip.type === 'collection' ? '💧' : '🚚'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {trip.type === 'collection'
                          ? t('driver.collection')
                          : t('driver.delivery')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(trip.date)} {formatTime(trip.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {trip.type === 'collection'
                        ? `${trip.quantity}L from ${trip.supplier || 'N/A'}`
                        : `${trip.quantity}L to ${trip.society || 'N/A'}`}
                    </p>
                    {trip.vehicle && (
                      <p className="text-xs text-gray-500">🚛 {trip.vehicle}</p>
                    )}
                    {trip.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {trip.location.latitude?.toFixed(4)}, {trip.location.longitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(trip.amount)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      trip.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : trip.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedTrip.type === 'collection'
                  ? t('driver.collectionDetails')
                  : t('driver.deliveryDetails')}
              </h2>
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
                  <span className="text-gray-600">{t('driver.type')}:</span>
                  <span className="ml-2 font-medium">
                    {selectedTrip.type === 'collection'
                      ? t('driver.collection')
                      : t('driver.delivery')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.date')}:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(selectedTrip.date)} {formatTime(selectedTrip.date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.quantity')}:</span>
                  <span className="ml-2 font-medium">{selectedTrip.quantity}L</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.totalAmount')}:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedTrip.amount)}</span>
                </div>
                {selectedTrip.type === 'collection' ? (
                  <>
                    <div>
                      <span className="text-gray-600">{t('driver.supplier')}:</span>
                      <span className="ml-2 font-medium">{selectedTrip.supplier || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('driver.purchaseRate')}:</span>
                      <span className="ml-2 font-medium">₹{selectedTrip.purchaseRate}/L</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-600">{t('driver.society')}:</span>
                      <span className="ml-2 font-medium">{selectedTrip.society || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('driver.deliveryRate')}:</span>
                      <span className="ml-2 font-medium">₹{selectedTrip.deliveryRate}/L</span>
                    </div>
                    {selectedTrip.signedBy && (
                      <div>
                        <span className="text-gray-600">{t('driver.signedBy')}:</span>
                        <span className="ml-2 font-medium">{selectedTrip.signedBy}</span>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <span className="text-gray-600">{t('driver.vehicle')}:</span>
                  <span className="ml-2 font-medium">{selectedTrip.vehicle || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedTrip.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTrip.status}
                  </span>
                </div>
              </div>

              {selectedTrip.location && (
                <div>
                  <span className="text-gray-600">{t('driver.location')}:</span>
                  <p className="mt-1 text-sm">
                    Lat: {selectedTrip.location.latitude?.toFixed(6)}, 
                    Long: {selectedTrip.location.longitude?.toFixed(6)}
                  </p>
                </div>
              )}

              {selectedTrip.notes && (
                <div>
                  <span className="text-gray-600">{t('driver.notes')}:</span>
                  <p className="mt-1 text-sm">{selectedTrip.notes}</p>
                </div>
              )}

              {selectedTrip.meterPhoto && (
                <div>
                  <span className="text-gray-600">{t('driver.meterPhoto')}:</span>
                  <img
                    src={selectedTrip.meterPhoto}
                    alt="Meter"
                    className="mt-2 max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {selectedTrip.signature && (
                <div>
                  <span className="text-gray-600">{t('driver.signature')}:</span>
                  <img
                    src={selectedTrip.signature}
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

export default TripHistory;

