import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './LogDelivery.css';

const LogDelivery = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    vehicleId: '',
    societyId: '',
    collectionId: '',
    quantity: '',
    deliveryRate: '',
    signedBy: '',
    notes: '',
  });
  const [location, setLocation] = useState(null);
  const [meterPhoto, setMeterPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [meterPhotoPreview, setMeterPhotoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSocieties();
    fetchVehicles();
    fetchCollections();
    getCurrentLocation();
  }, []);

  const fetchSocieties = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/societies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSocieties(res.data || []);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections(res.data.filter(c => c.status === 'completed') || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(t('common.locationError') || 'Unable to get location');
        }
      );
    } else {
      setError(t('common.locationNotSupported') || 'Geolocation not supported');
    }
  };

  const handlePhotoChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('common.fileTooLarge') || 'File size should be less than 5MB');
        return;
      }
      
      if (type === 'meter') {
        setMeterPhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setMeterPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (type === 'signature') {
        setSignature(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSignaturePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill delivery rate when society is selected
    if (name === 'societyId') {
      const society = societies.find((s) => s._id === value);
      if (society) {
        setFormData((prev) => ({
          ...prev,
          deliveryRate: society.deliveryRate || '',
        }));
      }
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.deliveryRate) || 0;
    return (qty * rate).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.vehicleId || !formData.societyId || !formData.quantity) {
      setError(t('common.fillAllFields') || 'Please fill all required fields');
      return;
    }

    if (!location) {
      setError(t('common.locationRequired') || 'Location is required');
      return;
    }

    if (!signature) {
      setError(t('delivery.signature') + ' ' + (t('common.required') || 'is required'));
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('vehicleId', formData.vehicleId);
      formDataToSend.append('societyId', formData.societyId);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('deliveryRate', formData.deliveryRate);
      formDataToSend.append('location', JSON.stringify(location));
      formDataToSend.append('signedBy', formData.signedBy);
      
      if (formData.collectionId) {
        formDataToSend.append('collectionId', formData.collectionId);
      }
      if (meterPhoto) {
        formDataToSend.append('meterPhoto', meterPhoto);
      }
      if (signature) {
        formDataToSend.append('signature', signature);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }

      await axios.post('/api/deliveries', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(t('delivery.addDelivery') + ' ' + t('common.success'));
      // Reset form
      setFormData({
        vehicleId: '',
        societyId: '',
        collectionId: '',
        quantity: '',
        deliveryRate: '',
        signedBy: '',
        notes: '',
      });
      setMeterPhoto(null);
      setSignature(null);
      setMeterPhotoPreview(null);
      setSignaturePreview(null);
      getCurrentLocation();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to submit')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="log-delivery">
        <h1 className="page-title">{t('delivery.addDelivery')}</h1>

        <Card>
          <form onSubmit={handleSubmit} className="delivery-form">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>{t('vehicle.title')}</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">{t('common.select') || 'Select Vehicle'}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber} ({vehicle.capacity}L)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('society.title')}</label>
                <select
                  name="societyId"
                  value={formData.societyId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">{t('common.select') || 'Select Society'}</option>
                  {societies.map((society) => (
                    <option key={society._id} value={society._id}>
                      {society.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{t('collection.title')} ({t('common.optional') || 'Optional'})</label>
              <select
                name="collectionId"
                value={formData.collectionId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">{t('common.select') || 'Select Collection'}</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.supplierId?.name} - {collection.quantity}L
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  type="number"
                  name="quantity"
                  label={t('delivery.quantity')}
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <Input
                  type="number"
                  name="deliveryRate"
                  label={t('delivery.deliveryRate')}
                  value={formData.deliveryRate}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {formData.quantity && formData.deliveryRate && (
              <div className="total-amount">
                <strong>{t('delivery.totalAmount')}: ₹{calculateTotal()}</strong>
              </div>
            )}

            <div className="form-group">
              <label>{t('delivery.location')}</label>
              {location ? (
                <div className="location-info">
                  <p>
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={getCurrentLocation}
                  >
                    {t('common.refresh') || 'Refresh Location'}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="info"
                  onClick={getCurrentLocation}
                >
                  {t('common.getLocation') || 'Get Location'}
                </Button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('delivery.meterPhoto')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e, 'meter')}
                  className="file-input"
                  capture="environment"
                />
                {meterPhotoPreview && (
                  <div className="photo-preview">
                    <img src={meterPhotoPreview} alt="Meter Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{t('delivery.signature')} *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e, 'signature')}
                  className="file-input"
                  capture="user"
                  required
                />
                {signaturePreview && (
                  <div className="photo-preview">
                    <img src={signaturePreview} alt="Signature Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <Input
                type="text"
                name="signedBy"
                label={t('delivery.signedBy')}
                value={formData.signedBy}
                onChange={handleChange}
                placeholder={t('delivery.signedBy')}
                required
              />
            </div>

            <div className="form-group">
              <Input
                type="text"
                name="notes"
                label={t('delivery.notes')}
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('delivery.notes')}
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={submitting}
                className="submit-btn"
              >
                {submitting ? t('common.loading') : t('common.submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
};

export default LogDelivery;

