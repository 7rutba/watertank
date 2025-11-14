import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './ManageSocieties.css';

const ManageSocieties = () => {
  const { t } = useTranslation();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    deliveryRate: '',
    paymentTerms: 'cash',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSocieties();
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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

      if (editingId) {
        await axios.put(`/api/societies/${editingId}`, formData, config);
        setSuccess(t('common.updateSuccess') || 'Society updated successfully');
      } else {
        await axios.post('/api/societies', formData, config);
        setSuccess(t('society.addSociety') + ' ' + t('common.success'));
      }

      fetchSocieties();
      resetForm();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to save')
      );
    }
  };

  const handleEdit = (society) => {
    setFormData({
      name: society.name || '',
      contactPerson: society.contactPerson || '',
      phone: society.phone || '',
      email: society.email || '',
      deliveryRate: society.deliveryRate || '',
      paymentTerms: society.paymentTerms || 'cash',
      address: society.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    });
    setEditingId(society._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/societies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(t('common.deleteSuccess') || 'Society deleted successfully');
      fetchSocieties();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to delete')
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      deliveryRate: '',
      paymentTerms: 'cash',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
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
      <div className="manage-societies">
        <div className="page-header">
          <h1 className="page-title">{t('society.title')}</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('common.cancel') : t('society.addSociety')}
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h2>{editingId ? t('common.edit') : t('society.addSociety')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="society-form">
              <div className="form-row">
                <Input
                  type="text"
                  name="name"
                  label={t('society.name') + ' *'}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  name="contactPerson"
                  label={t('society.contactPerson')}
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <Input
                  type="tel"
                  name="phone"
                  label={t('society.phone') + ' *'}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  label={t('society.email')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <Input
                  type="number"
                  name="deliveryRate"
                  label={t('society.deliveryRate') + ' *'}
                  value={formData.deliveryRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
                <div className="form-group">
                  <label>{t('society.paymentTerms')}</label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="cash">{t('supplier.cash')}</option>
                    <option value="credit_7">{t('supplier.credit7')}</option>
                    <option value="credit_15">{t('supplier.credit15')}</option>
                    <option value="credit_30">{t('supplier.credit30')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('society.address')}</label>
                <Input
                  type="text"
                  name="address.street"
                  placeholder={t('common.street') || 'Street'}
                  value={formData.address.street}
                  onChange={handleChange}
                />
                <div className="form-row">
                  <Input
                    type="text"
                    name="address.city"
                    placeholder={t('common.city') || 'City'}
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                  <Input
                    type="text"
                    name="address.state"
                    placeholder={t('common.state') || 'State'}
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                  <Input
                    type="text"
                    name="address.zipCode"
                    placeholder={t('common.zipCode') || 'Zip Code'}
                    value={formData.address.zipCode}
                    onChange={handleChange}
                  />
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

        <div className="societies-list">
          {societies.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            societies.map((society) => (
              <Card key={society._id} className="society-card">
                <div className="society-header">
                  <h3>{society.name}</h3>
                  <div className="society-actions">
                    <Button
                      variant="info"
                      size="small"
                      onClick={() => handleEdit(society)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(society._id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
                <div className="society-details">
                  <p><strong>{t('society.contactPerson')}:</strong> {society.contactPerson || 'N/A'}</p>
                  <p><strong>{t('society.phone')}:</strong> {society.phone}</p>
                  <p><strong>{t('society.email')}:</strong> {society.email || 'N/A'}</p>
                  <p><strong>{t('society.deliveryRate')}:</strong> ₹{society.deliveryRate}</p>
                  <p><strong>{t('society.paymentTerms')}:</strong> {t(`supplier.${society.paymentTerms}`)}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default ManageSocieties;

