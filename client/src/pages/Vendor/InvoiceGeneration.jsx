import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './InvoiceGeneration.css';

const InvoiceGeneration = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    relatedTo: 'society',
    relatedId: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchSocieties();
    fetchSuppliers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.relatedId || !formData.startDate || !formData.endDate) {
      setError(t('common.fillAllFields') || 'Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/invoices/generate-monthly',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(t('invoice.generateMonthly') + ' ' + t('common.success'));
      fetchInvoices();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to generate invoice')
      );
    }
  };

  const handleSendInvoice = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/invoices/${id}/send`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(t('invoice.send') + ' ' + t('common.success'));
      fetchInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to send invoice')
      );
    }
  };

  const resetForm = () => {
    setFormData({
      relatedTo: 'society',
      relatedId: '',
      startDate: '',
      endDate: '',
    });
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      sent: 'status-sent',
      paid: 'status-paid',
      overdue: 'status-overdue',
      cancelled: 'status-cancelled',
    };
    return statusClasses[status] || '';
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
      <div className="invoice-generation">
        <div className="page-header">
          <h1 className="page-title">{t('invoice.title')}</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('common.cancel') : t('invoice.generateMonthly')}
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h2>{t('invoice.generateMonthly')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleGenerate} className="invoice-form">
              <div className="form-group">
                <label>{t('invoice.type')}</label>
                <select
                  name="relatedTo"
                  value={formData.relatedTo}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="society">{t('society.title')}</option>
                  <option value="supplier">{t('supplier.title')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {formData.relatedTo === 'society' ? t('society.title') : t('supplier.title')} *
                </label>
                <select
                  name="relatedId"
                  value={formData.relatedId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {(formData.relatedTo === 'society' ? societies : suppliers).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <Input
                  type="date"
                  name="startDate"
                  label={t('common.startDate') + ' *'}
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="date"
                  name="endDate"
                  label={t('common.endDate') + ' *'}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {t('invoice.generateMonthly')}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="invoices-list">
          {invoices.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice._id} className="invoice-card">
                <div className="invoice-header">
                  <div>
                    <h3>{invoice.invoiceNumber}</h3>
                    <span className={`status-badge ${getStatusBadge(invoice.status)}`}>
                      {t(`invoice.${invoice.status}`)}
                    </span>
                  </div>
                  <div className="invoice-amount">
                    ₹{invoice.total.toFixed(2)}
                  </div>
                </div>

                <div className="invoice-details">
                  <p><strong>{t('invoice.type')}:</strong> {t(`invoice.${invoice.type}`)}</p>
                  <p><strong>{invoice.relatedTo === 'society' ? t('society.title') : t('supplier.title')}:</strong> {invoice.relatedId?.name || 'N/A'}</p>
                  {invoice.period && (
                    <p>
                      <strong>{t('invoice.period')}:</strong>{' '}
                      {new Date(invoice.period.startDate).toLocaleDateString()} -{' '}
                      {new Date(invoice.period.endDate).toLocaleDateString()}
                    </p>
                  )}
                  <p><strong>{t('invoice.items') || 'Items'}:</strong> {invoice.items?.length || 0}</p>
                  {invoice.dueDate && (
                    <p><strong>{t('invoice.dueDate')}:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="invoice-actions">
                  {invoice.status === 'draft' && (
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => handleSendInvoice(invoice._id)}
                    >
                      {t('invoice.send')}
                    </Button>
                  )}
                  <Button variant="info" size="small">
                    {t('common.view') || 'View'}
                  </Button>
                  {invoice.pdfUrl && (
                    <Button variant="secondary" size="small">
                      {t('common.download') || 'Download PDF'}
                    </Button>
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

export default InvoiceGeneration;

