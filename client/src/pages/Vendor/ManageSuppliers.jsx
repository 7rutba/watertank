import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './ManageSuppliers.css';

const ManageSuppliers = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    purchaseRate: '',
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
    fetchSuppliers();
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
        await axios.put(`/api/suppliers/${editingId}`, formData, config);
        setSuccess(t('common.updateSuccess') || 'Supplier updated successfully');
      } else {
        await axios.post('/api/suppliers', formData, config);
        setSuccess(t('supplier.addSupplier') + ' ' + t('common.success'));
      }

      fetchSuppliers();
      resetForm();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to save')
      );
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      purchaseRate: supplier.purchaseRate || '',
      paymentTerms: supplier.paymentTerms || 'cash',
      address: supplier.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    });
    setEditingId(supplier._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(t('common.deleteSuccess') || 'Supplier deleted successfully');
      fetchSuppliers();
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
      purchaseRate: '',
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
      <div className="manage-suppliers">
        <div className="page-header">
          <h1 className="page-title">{t('supplier.title')}</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('common.cancel') : t('supplier.addSupplier')}
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h2>{editingId ? t('common.edit') : t('supplier.addSupplier')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="supplier-form">
              <div className="form-row">
                <Input
                  type="text"
                  name="name"
                  label={t('supplier.name') + ' *'}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  name="contactPerson"
                  label={t('supplier.contactPerson')}
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <Input
                  type="tel"
                  name="phone"
                  label={t('supplier.phone') + ' *'}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  label={t('supplier.email')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <Input
                  type="number"
                  name="purchaseRate"
                  label={t('supplier.purchaseRate') + ' *'}
                  value={formData.purchaseRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
                <div className="form-group">
                  <label>{t('supplier.paymentTerms')}</label>
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
                <label>{t('supplier.address')}</label>
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

        <div className="suppliers-list">
          {suppliers.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            suppliers.map((supplier) => (
              <Card key={supplier._id} className="supplier-card">
                <div className="supplier-header">
                  <h3>{supplier.name}</h3>
                  <div className="supplier-actions">
                    <Button
                      variant="info"
                      size="small"
                      onClick={() => handleEdit(supplier)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(supplier._id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
                <div className="supplier-details">
                  <p><strong>{t('supplier.contactPerson')}:</strong> {supplier.contactPerson || 'N/A'}</p>
                  <p><strong>{t('supplier.phone')}:</strong> {supplier.phone}</p>
                  <p><strong>{t('supplier.email')}:</strong> {supplier.email || 'N/A'}</p>
                  <p><strong>{t('supplier.purchaseRate')}:</strong> ₹{supplier.purchaseRate}</p>
                  <p><strong>{t('supplier.paymentTerms')}:</strong> {t(`supplier.${supplier.paymentTerms}`)}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default ManageSuppliers;

