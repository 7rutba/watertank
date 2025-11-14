import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SignatureCanvas from '../../components/SignatureCanvas';
import useGeolocation from '../../hooks/useGeolocation';

const LogDelivery = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location, error: locationError, loading: locationLoading, getCurrentLocation, clearLocation } = useGeolocation();

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    societyId: '',
    collectionId: '',
    quantity: '',
    deliveryRate: '',
    signedBy: '',
    notes: '',
  });
  const [meterPhoto, setMeterPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signature, setSignature] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchSocieties();
    fetchRecentCollections();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Auto-fill delivery rate when society is selected
    if (formData.societyId) {
      const society = societies.find(s => s._id === formData.societyId);
      if (society && society.deliveryRate) {
        setFormData(prev => ({
          ...prev,
          deliveryRate: society.deliveryRate.toString(),
        }));
      }
    }
  }, [formData.societyId, societies]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await api.get('/societies');
      setSocieties(response.data || []);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const fetchRecentCollections = async () => {
    try {
      const response = await api.get('/collections?limit=10');
      setRecentCollections(response.data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          meterPhoto: 'Photo size must be less than 5MB',
        }));
        return;
      }
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
    const fileInput = document.getElementById('meterPhoto');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSignatureChange = (signatureData) => {
    setSignature(signatureData);
    if (errors.signature) {
      setErrors(prev => ({
        ...prev,
        signature: '',
      }));
    }
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.deliveryRate) || 0;
    return quantity * rate;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicleId) {
      newErrors.vehicleId = t('driver.selectVehicle') + ' is required';
    }
    if (!formData.societyId) {
      newErrors.societyId = t('driver.selectSociety') + ' is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.deliveryRate || parseFloat(formData.deliveryRate) <= 0) {
      newErrors.deliveryRate = 'Delivery rate must be greater than 0';
    }
    if (!location) {
      newErrors.location = 'GPS location is required';
    }
    if (!meterPhoto) {
      newErrors.meterPhoto = 'Meter photo is required';
    }
    if (!signature) {
      newErrors.signature = 'Signature is required';
    }
    if (!formData.signedBy || formData.signedBy.trim() === '') {
      newErrors.signedBy = 'Signed by name is required';
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
      submitData.append('societyId', formData.societyId);
      if (formData.collectionId) {
        submitData.append('collectionId', formData.collectionId);
      }
      submitData.append('quantity', formData.quantity);
      submitData.append('deliveryRate', formData.deliveryRate);
      submitData.append('location', JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      submitData.append('signedBy', formData.signedBy);
      if (formData.notes) {
        submitData.append('notes', formData.notes);
      }
      if (meterPhoto) {
        submitData.append('meterPhoto', meterPhoto);
      }
      if (signature) {
        // Convert data URL to blob
        const response = await fetch(signature);
        const blob = await response.blob();
        submitData.append('signature', blob, 'signature.png');
      }

      await api.post('/deliveries', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(t('driver.deliveryLogged'));
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error submitting delivery:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to log delivery. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('driver.logDelivery')}</h1>
        <p className="text-gray-600 mt-1">{t('driver.deliveryDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
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

        {/* Society Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.society')} *
          </label>
          <select
            name="societyId"
            value={formData.societyId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.societyId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">{t('driver.selectSociety')}</option>
            {societies.map((society) => (
              <option key={society._id} value={society._id}>
                {society.name}
              </option>
            ))}
          </select>
          {errors.societyId && (
            <p className="mt-1 text-sm text-red-600">{errors.societyId}</p>
          )}
        </div>

        {/* Link Collection (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.linkCollection')}
          </label>
          <select
            name="collectionId"
            value={formData.collectionId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">{t('driver.selectCollection')}</option>
            {recentCollections.map((collection) => (
              <option key={collection._id} value={collection._id}>
                {new Date(collection.createdAt).toLocaleDateString()} - {collection.quantity}L from {collection.supplierId?.name || 'N/A'}
              </option>
            ))}
          </select>
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

        {/* Delivery Rate */}
        <div>
          <Input
            label={`${t('driver.ratePerLiter')} *`}
            type="number"
            name="deliveryRate"
            value={formData.deliveryRate}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            error={errors.deliveryRate}
          />
        </div>

        {/* Total Amount */}
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
        </div>

        {/* Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.signature')} *
          </label>
          <SignatureCanvas
            onSignatureChange={handleSignatureChange}
            width={400}
            height={200}
          />
          {errors.signature && (
            <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
          )}
        </div>

        {/* Signed By */}
        <div>
          <Input
            label={`${t('driver.signedBy')} *`}
            type="text"
            name="signedBy"
            value={formData.signedBy}
            onChange={handleChange}
            placeholder={t('driver.enterSignerName')}
            required
            error={errors.signedBy}
          />
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

export default LogDelivery;

