import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './ManageVehicles.css';

const ManageVehicles = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'tanker',
    capacity: '',
    driverId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users?role=driver', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const dataToSend = {
        ...formData,
        driverId: formData.driverId || null,
      };

      if (editingId) {
        await axios.put(`/api/vehicles/${editingId}`, dataToSend, config);
        setSuccess(t('common.updateSuccess') || 'Vehicle updated successfully');
      } else {
        await axios.post('/api/vehicles', dataToSend, config);
        setSuccess(t('vehicle.addVehicle') + ' ' + t('common.success'));
      }

      fetchVehicles();
      resetForm();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to save')
      );
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber || '',
      vehicleType: vehicle.vehicleType || 'tanker',
      capacity: vehicle.capacity || '',
      driverId: vehicle.driverId?._id || '',
    });
    setEditingId(vehicle._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(t('common.deleteSuccess') || 'Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to delete')
      );
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      vehicleType: 'tanker',
      capacity: '',
      driverId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Container>
        <div className="loading-container">
          <p>{t('common.loading')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="manage-vehicles">
        <div className="page-header">
          <h1 className="page-title">{t('vehicle.title')}</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('common.cancel') : t('vehicle.addVehicle')}
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h2>{editingId ? t('common.edit') : t('vehicle.addVehicle')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-row">
                <Input
                  type="text"
                  name="vehicleNumber"
                  label={t('vehicle.vehicleNumber') + ' *'}
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="ABC-1234"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
                <div className="form-group">
                  <label>{t('vehicle.vehicleType')}</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="tanker">{t('vehicle.tanker')}</option>
                    <option value="tractor">{t('vehicle.tractor')}</option>
                    <option value="truck">{t('vehicle.truck')}</option>
                    <option value="other">{t('vehicle.other')}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <Input
                  type="number"
                  name="capacity"
                  label={t('vehicle.capacity') + ' *'}
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
                <div className="form-group">
                  <label>{t('vehicle.driver')} ({t('common.optional')})</label>
                  <select
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">{t('common.select') || 'Select Driver'}</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingId ? t('common.save') : t('common.add')}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="vehicles-list">
          {vehicles.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            vehicles.map((vehicle) => (
              <Card key={vehicle._id} className="vehicle-card">
                <div className="vehicle-header">
                  <div>
                    <h3>{vehicle.vehicleNumber}</h3>
                    <span className={`status-badge ${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
                      {vehicle.isAvailable ? t('vehicle.isAvailable') : t('vehicle.isNotAvailable')}
                    </span>
                  </div>
                  <div className="vehicle-actions">
                    <Button
                      variant="info"
                      size="small"
                      onClick={() => handleEdit(vehicle)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(vehicle._id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
                <div className="vehicle-details">
                  <p><strong>{t('vehicle.vehicleType')}:</strong> {t(`vehicle.${vehicle.vehicleType}`)}</p>
                  <p><strong>{t('vehicle.capacity')}:</strong> {vehicle.capacity}L</p>
                  <p><strong>{t('vehicle.driver')}:</strong> {vehicle.driverId?.name || 'N/A'}</p>
                  {vehicle.currentLocation && (
                    <p className="location-info">
                      <strong>{t('vehicle.currentLocation')}:</strong>{' '}
                      {vehicle.currentLocation.latitude?.toFixed(4)}, {vehicle.currentLocation.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default ManageVehicles;

