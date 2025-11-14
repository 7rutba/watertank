import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './LogCollection.css';

const LogCollection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    vehicleId: '',
    supplierId: '',
    quantity: '',
    purchaseRate: '',
    notes: '',
  });
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSuppliers();
    fetchVehicles();
    getCurrentLocation();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('common.fileTooLarge') || 'File size should be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill purchase rate when supplier is selected
    if (name === 'supplierId') {
      const supplier = suppliers.find((s) => s._id === value);
      if (supplier) {
        setFormData((prev) => ({
          ...prev,
          purchaseRate: supplier.purchaseRate || '',
        }));
      }
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.purchaseRate) || 0;
    return (qty * rate).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.vehicleId || !formData.supplierId || !formData.quantity) {
      setError(t('common.fillAllFields') || 'Please fill all required fields');
      return;
    }

    if (!location) {
      setError(t('common.locationRequired') || 'Location is required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('vehicleId', formData.vehicleId);
      formDataToSend.append('supplierId', formData.supplierId);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('purchaseRate', formData.purchaseRate);
      formDataToSend.append('location', JSON.stringify(location));
      if (photo) {
        formDataToSend.append('meterPhoto', photo);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }

      await axios.post('/api/collections', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(t('collection.addCollection') + ' ' + t('common.success'));
      // Reset form
      setFormData({
        vehicleId: '',
        supplierId: '',
        quantity: '',
        purchaseRate: '',
        notes: '',
      });
      setPhoto(null);
      setPhotoPreview(null);
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
      <div className="log-collection">
        <h1 className="page-title">{t('collection.addCollection')}</h1>

        <Card>
          <form onSubmit={handleSubmit} className="collection-form">
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
                <label>{t('supplier.title')}</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">{t('common.select') || 'Select Supplier'}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  type="number"
                  name="quantity"
                  label={t('collection.quantity')}
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
                  name="purchaseRate"
                  label={t('collection.purchaseRate')}
                  value={formData.purchaseRate}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {formData.quantity && formData.purchaseRate && (
              <div className="total-amount">
                <strong>{t('collection.totalAmount')}: ₹{calculateTotal()}</strong>
              </div>
            )}

            <div className="form-group">
              <label>{t('collection.location')}</label>
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

            <div className="form-group">
              <label>{t('collection.meterPhoto')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="file-input"
                capture="environment"
              />
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <Input
                type="text"
                name="notes"
                label={t('collection.notes')}
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('collection.notes')}
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

export default LogCollection;

