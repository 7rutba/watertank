import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Vehicles = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'tanker',
    capacity: '',
    driverId: '',
    isActive: true,
    isAvailable: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError(error.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.filter(d => d.isActive));
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicleDetails = async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}`);
      setSelectedVehicle(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      alert(error.response?.data?.message || 'Failed to load vehicle details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const submitData = {
        ...formData,
        capacity: parseFloat(formData.capacity) || 0,
        driverId: formData.driverId || null,
      };
      
      if (selectedVehicle) {
        // Update existing vehicle
        await api.put(`/vehicles/${selectedVehicle._id}`, submitData);
      } else {
        // Create new vehicle
        await api.post('/vehicles', submitData);
      }
      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError(error.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      fetchVehicles();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity.toString(),
      driverId: vehicle.driverId?._id || '',
      isActive: vehicle.isActive,
      isAvailable: vehicle.isAvailable,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      vehicleType: 'tanker',
      capacity: '',
      driverId: '',
      isActive: true,
      isAvailable: true,
    });
    setSelectedVehicle(null);
    setError('');
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN');
  };

  const getGoogleMapsUrl = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.vehicles')}</h1>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.vehicles')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your vehicles and track their locations</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          variant="primary"
          className="w-full sm:w-auto"
        >
          {t('vendor.addVehicle')}
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
          placeholder="Search vehicles by number, type, or driver..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      {/* Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('vendor.noVehicles')}</p>
              </div>
            </Card>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle._id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{vehicle.vehicleNumber}</h3>
                  <p className="text-sm text-gray-600 capitalize">{vehicle.vehicleType}</p>
                  <p className="text-sm text-gray-600">{vehicle.capacity}L capacity</p>
                  {vehicle.driverId && (
                    <p className="text-sm text-primary mt-1">
                      👨‍✈️ {vehicle.driverId.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      vehicle.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      vehicle.isAvailable
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {vehicle.isAvailable ? t('vendor.available') : t('vendor.unavailable')}
                  </span>
                </div>
              </div>
              
              {vehicle.currentLocation && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
                  <p className="text-gray-600">📍 Location tracked</p>
                  <p className="text-gray-500">
                    Updated: {formatDate(vehicle.currentLocation.lastUpdated)}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => fetchVehicleDetails(vehicle._id)}
                  className="flex-1"
                >
                  {t('vendor.viewDetails')}
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => handleDelete(vehicle._id)}
                  className="flex-1"
                >
                  {t('common.delete')}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedVehicle ? t('vendor.editVehicle') : t('vendor.addVehicle')}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('vendor.vehicleNumber')}
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="MH-01-AB-1234"
                required
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.vehicleType')} *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                >
                  <option value="tanker">{t('vendor.tanker')}</option>
                  <option value="tractor">{t('vendor.tractor')}</option>
                  <option value="truck">{t('vendor.truck')}</option>
                  <option value="other">{t('vendor.other')}</option>
                </select>
              </div>
              
              <Input
                label={t('vendor.capacity')}
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="10000"
                required
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('vendor.assignDriver')}
                </label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">{t('vendor.noDriver')}</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} ({driver.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">{t('common.active')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">{t('vendor.available')}</span>
                </label>
              </div>
              
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

      {/* Vehicle Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedVehicle.vehicleNumber}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedVehicle(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Vehicle Info */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.vehicleInfo')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('vendor.vehicleNumber')}:</span>
                    <span className="ml-2 font-medium">{selectedVehicle.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.vehicleType')}:</span>
                    <span className="ml-2 font-medium capitalize">{selectedVehicle.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.capacity')}:</span>
                    <span className="ml-2 font-medium">{selectedVehicle.capacity}L</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('common.status')}:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedVehicle.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVehicle.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.availability')}:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedVehicle.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedVehicle.isAvailable ? t('vendor.available') : t('vendor.unavailable')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Driver Assignment */}
              {selectedVehicle.driverId ? (
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.assignedDriver')}</h3>
                  <div className="text-sm">
                    <p className="font-medium">{selectedVehicle.driverId.name}</p>
                    <p className="text-gray-600">{selectedVehicle.driverId.email}</p>
                    {selectedVehicle.driverId.phone && (
                      <p className="text-gray-600">{selectedVehicle.driverId.phone}</p>
                    )}
                  </div>
                </Card>
              ) : (
                <Card>
                  <p className="text-sm text-gray-500">{t('vendor.noDriverAssigned')}</p>
                </Card>
              )}

              {/* GPS Location */}
              {selectedVehicle.currentLocation && selectedVehicle.currentLocation.latitude && (
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-3">📍 {t('vendor.currentLocation')}</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-medium">{selectedVehicle.currentLocation.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-medium">{selectedVehicle.currentLocation.longitude.toFixed(6)}</span>
                    </div>
                    {selectedVehicle.currentLocation.lastUpdated && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(selectedVehicle.currentLocation.lastUpdated)}</span>
                      </div>
                    )}
                  </div>
                  {getGoogleMapsUrl(
                    selectedVehicle.currentLocation.latitude,
                    selectedVehicle.currentLocation.longitude
                  ) && (
                    <a
                      href={getGoogleMapsUrl(
                        selectedVehicle.currentLocation.latitude,
                        selectedVehicle.currentLocation.longitude
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover text-sm"
                    >
                      {t('vendor.viewOnMap')}
                    </a>
                  )}
                </Card>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleEdit(selectedVehicle)}
                className="flex-1"
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowDetailsModal(false); setSelectedVehicle(null); }}
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

export default Vehicles;

