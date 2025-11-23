import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import api from '../../../utils/api';

const RecordPayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    type: searchParams.get('type') || 'purchase',
    relatedTo: searchParams.get('relatedTo') || 'supplier',
    relatedId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchSuppliers();
    fetchSocieties();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (formData.relatedTo === 'society' && formData.type === 'delivery') {
      fetchInvoices();
    }
  }, [formData.relatedTo, formData.type]);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices?status=sent,overdue');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await api.get('/societies');
      setSocieties(response.data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/payments', formData);
      alert('Payment recorded successfully');
      navigate('/vendor/payments');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getRelatedOptions = () => {
    if (formData.relatedTo === 'supplier') return suppliers;
    if (formData.relatedTo === 'society') return societies;
    if (formData.relatedTo === 'driver') return drivers;
    return [];
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Record Payment"
        subtitle="Record a new payment transaction"
      />

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.paymentType')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              >
                <option value="purchase">Purchase</option>
                <option value="delivery">Delivery</option>
                <option value="expense">Expense</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.relatedTo')} *
              </label>
              <select
                value={formData.relatedTo}
                onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value, relatedId: '', invoiceId: '' })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              >
                <option value="supplier">Supplier</option>
                <option value="society">Society</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.relatedTo === 'supplier' ? 'Supplier' : 
               formData.relatedTo === 'society' ? 'Society' : 'Driver'} *
            </label>
            <select
              value={formData.relatedId}
              onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            >
              <option value="">Select...</option>
              {getRelatedOptions().map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
          
          {formData.type === 'delivery' && formData.relatedTo === 'society' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice (Optional)
              </label>
              <select
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">Select Invoice...</option>
                {invoices.filter(inv => inv.relatedTo === 'society' && inv.relatedId._id === formData.relatedId).map(invoice => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber} - ₹{invoice.total?.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.amount')} *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.paymentMethod')} *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                required
              >
                <option value="cash">{t('vendor.cash')}</option>
                <option value="bank_transfer">{t('vendor.bankTransfer')}</option>
                <option value="upi">{t('vendor.upi')}</option>
                <option value="cheque">{t('vendor.cheque')}</option>
                <option value="card">{t('vendor.card')}</option>
                <option value="neft">{t('vendor.neft')}</option>
                <option value="rtgs">{t('vendor.rtgs')}</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.paymentDate')} *
              </label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.referenceNumber')}
              </label>
              <Input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('vendor.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting} className="flex-1">
              {submitting ? t('common.loading') : 'Record Payment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vendor/payments')}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RecordPayment;

