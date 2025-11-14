import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useGeolocation from '../../hooks/useGeolocation';

const LogCollection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location, error: locationError, loading: locationLoading, getCurrentLocation, clearLocation } = useGeolocation();

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    supplierId: '',
    quantity: '',
    purchaseRate: '',
    notes: '',
  });
  const [meterPhoto, setMeterPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchSuppliers();
    // Auto-capture location on mount
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Auto-fill purchase rate when supplier is selected
    if (formData.supplierId) {
      const supplier = suppliers.find(s => s._id === formData.supplierId);
      if (supplier && supplier.purchaseRate) {
        setFormData(prev => ({
          ...prev,
          purchaseRate: supplier.purchaseRate.toString(),
        }));
      }
    }
  }, [formData.supplierId, suppliers]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          meterPhoto: 'Photo size must be less than 5MB',
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          meterPhoto: 'Please select an image file',
        }));
        return;
      }

      setMeterPhoto(file);
      setErrors(prev => ({
        ...prev,
        meterPhoto: '',
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setMeterPhoto(null);
    setPhotoPreview(null);
    // Reset file input
    const fileInput = document.getElementById('meterPhoto');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.purchaseRate) || 0;
    return quantity * rate;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = t('driver.selectVehicle') + ' is required';
    }
    if (!formData.supplierId) {
      newErrors.supplierId = t('driver.selectSupplier') + ' is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.purchaseRate || parseFloat(formData.purchaseRate) <= 0) {
      newErrors.purchaseRate = 'Purchase rate must be greater than 0';
    }
    if (!location) {
      newErrors.location = 'GPS location is required. Please capture location.';
    }
    if (!meterPhoto) {
      newErrors.meterPhoto = 'Meter photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('vehicleId', formData.vehicleId);
      submitData.append('supplierId', formData.supplierId);
      submitData.append('quantity', formData.quantity);
      submitData.append('purchaseRate', formData.purchaseRate);
      // Location needs to be sent as JSON string for FormData
      submitData.append('location', JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      if (formData.notes) {
        submitData.append('notes', formData.notes);
      }
      if (meterPhoto) {
        submitData.append('meterPhoto', meterPhoto);
      }

      await api.post('/collections', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success - show message and navigate
      alert(t('driver.collectionLogged'));
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error submitting collection:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to log collection. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('driver.logCollection')}</h1>
        <p className="text-gray-600 mt-1">{t('driver.collectionDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Vehicle Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.vehicle')} *
          </label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.vehicleId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">{t('driver.selectVehicle')}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.vehicleNumber} ({vehicle.vehicleType})
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
          )}
        </div>

        {/* Supplier Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.supplier')} *
          </label>
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.supplierId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">{t('driver.selectSupplier')}</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <Input
            label={`${t('driver.quantityLiters')} *`}
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
            required
            error={errors.quantity}
          />
        </div>

        {/* Purchase Rate */}
        <div>
          <Input
            label={`${t('driver.ratePerLiter')} *`}
            type="number"
            name="purchaseRate"
            value={formData.purchaseRate}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            error={errors.purchaseRate}
          />
        </div>

        {/* Total Amount (Read-only) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">{t('driver.totalAmount')}:</span>
            <span className="text-2xl font-bold text-primary">
              ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* GPS Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.gpsLocation')} *
          </label>
          {location ? (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-800 font-medium">{t('driver.locationCaptured')}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                    </p>
                    {location.accuracy && (
                      <p className="text-xs text-green-600">Accuracy: ±{Math.round(location.accuracy)}m</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{locationError}</p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full"
              >
                {locationLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : (
                  `📍 ${t('driver.captureLocation')}`
                )}
              </Button>
            </div>
          )}
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Meter Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.meterPhoto')} *
          </label>
          {photoPreview ? (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Meter preview"
                  className="w-full h-64 object-contain border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('meterPhoto').click()}
                className="w-full"
              >
                {t('driver.changePhoto')}
              </Button>
            </div>
          ) : (
            <div>
              <input
                id="meterPhoto"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('meterPhoto').click()}
                className="w-full"
              >
                📷 {t('driver.takePhoto')}
              </Button>
            </div>
          )}
          {errors.meterPhoto && (
            <p className="mt-1 text-sm text-red-600">{errors.meterPhoto}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {t('driver.photoHint')}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.notes')} ({t('common.optional')})
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t('driver.notesPlaceholder')}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || locationLoading}
            className="flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('driver.submitting')}
              </span>
            ) : (
              t('driver.submit')
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/driver/dashboard')}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogCollection;

