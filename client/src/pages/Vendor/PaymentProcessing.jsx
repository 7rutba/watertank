import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './PaymentProcessing.css';

const PaymentProcessing = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'delivery',
    relatedTo: 'society',
    relatedId: '',
    invoiceId: '',
    expenseId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchExpenses();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices?status=sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(res.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/expenses?status=approved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-fill amount from invoice if selected
    if (name === 'invoiceId' && value) {
      const invoice = invoices.find(i => i._id === value);
      if (invoice) {
        setFormData((prev) => ({
          ...prev,
          amount: invoice.total,
          relatedTo: invoice.relatedTo,
          relatedId: invoice.relatedId._id || invoice.relatedId,
        }));
      }
    }
    
    // Auto-fill amount from expense if selected
    if (name === 'expenseId' && value) {
      const expense = expenses.find(e => e._id === value);
      if (expense) {
        setFormData((prev) => ({
          ...prev,
          amount: expense.amount,
          type: 'expense',
          relatedTo: 'driver',
          relatedId: expense.driverId._id || expense.driverId,
        }));
      }
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.amount || !formData.relatedId) {
      setError(t('common.fillAllFields') || 'Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/payments',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(t('payment.addPayment') + ' ' + t('common.success'));
      fetchPayments();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to process payment')
      );
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'delivery',
      relatedTo: 'society',
      relatedId: '',
      invoiceId: '',
      expenseId: '',
      amount: '',
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    });
    setShowForm(false);
  };

  const getPaymentTypeLabel = (type) => {
    return t(`payment.${type}`) || type;
  };

  const getPaymentMethodLabel = (method) => {
    return t(`payment.${method}`) || method;
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
      <div className="payment-processing">
        <div className="page-header">
          <h1 className="page-title">{t('payment.title')}</h1>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t('common.cancel') : t('payment.addPayment')}
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h2>{t('payment.addPayment')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('payment.type')} *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="purchase">{t('payment.purchase')}</option>
                    <option value="delivery">{t('payment.delivery')}</option>
                    <option value="expense">{t('payment.expense')}</option>
                    <option value="other">{t('common.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('payment.paymentMethod')} *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="cash">{t('payment.cash')}</option>
                    <option value="bank_transfer">{t('payment.bankTransfer')}</option>
                    <option value="upi">{t('payment.upi')}</option>
                    <option value="cheque">{t('payment.cheque')}</option>
                    <option value="card">{t('payment.card')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('invoice.title')} ({t('common.optional')})</label>
                <select
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">{t('common.select')}</option>
                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - ₹{invoice.total} ({invoice.relatedId?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('expense.title')} ({t('common.optional')})</label>
                <select
                  name="expenseId"
                  value={formData.expenseId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">{t('common.select')}</option>
                  {expenses.map((expense) => (
                    <option key={expense._id} value={expense._id}>
                      {expense.driverId?.name} - ₹{expense.amount} ({t(`expense.${expense.category}`)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <Input
                  type="text"
                  name="relatedId"
                  label={t('payment.relatedTo') || 'Related To ID'} 
                  value={formData.relatedId}
                  onChange={handleChange}
                  placeholder="ID"
                />
                <Input
                  type="number"
                  name="amount"
                  label={t('payment.amount') + ' *'}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-row">
                <Input
                  type="date"
                  name="paymentDate"
                  label={t('payment.paymentDate')}
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  name="referenceNumber"
                  label={t('payment.referenceNumber')}
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder={t('payment.referenceNumber')}
                />
              </div>

              <div className="form-group">
                <Input
                  type="text"
                  name="notes"
                  label={t('payment.notes') || 'Notes'}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('payment.notes') || 'Notes'}
                />
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {t('common.submit')}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="payments-list">
          {payments.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            payments.map((payment) => (
              <Card key={payment._id} className="payment-card">
                <div className="payment-header">
                  <div>
                    <h3>{getPaymentTypeLabel(payment.type)}</h3>
                    <span className={`status-badge status-${payment.status}`}>
                      {t(`payment.status`) || payment.status}
                    </span>
                  </div>
                  <div className="payment-amount">
                    ₹{payment.amount.toFixed(2)}
                  </div>
                </div>

                <div className="payment-details">
                  <p><strong>{t('payment.paymentMethod')}:</strong> {getPaymentMethodLabel(payment.paymentMethod)}</p>
                  <p><strong>{t('payment.paymentDate')}:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</p>
                  {payment.referenceNumber && (
                    <p><strong>{t('payment.referenceNumber')}:</strong> {payment.referenceNumber}</p>
                  )}
                  {payment.invoiceId && (
                    <p><strong>{t('invoice.title')}:</strong> {payment.invoiceId?.invoiceNumber || payment.invoiceId}</p>
                  )}
                  {payment.expenseId && (
                    <p><strong>{t('expense.title')}:</strong> ₹{payment.expenseId?.amount || payment.expenseId}</p>
                  )}
                  {payment.notes && (
                    <p><strong>{t('payment.notes')}:</strong> {payment.notes}</p>
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

export default PaymentProcessing;

