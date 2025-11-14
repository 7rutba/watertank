import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Payments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceIdParam = searchParams.get('invoiceId');

  const [loading, setLoading] = useState(true);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceId: invoiceIdParam || '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOutstandingInvoices();
    fetchPaymentHistory();
    if (invoiceIdParam) {
      setShowPaymentForm(true);
      setFormData(prev => ({ ...prev, invoiceId: invoiceIdParam }));
    }
  }, [invoiceIdParam]);

  useEffect(() => {
    // Auto-fill amount when invoice is selected
    if (formData.invoiceId) {
      const invoice = outstandingInvoices.find(inv => inv._id === formData.invoiceId);
      if (invoice) {
        const outstanding = calculateOutstanding(invoice);
        setFormData(prev => ({
          ...prev,
          amount: outstanding.toString(),
        }));
        setSelectedInvoice(invoice);
      }
    }
  }, [formData.invoiceId, outstandingInvoices]);

  const fetchOutstandingInvoices = async () => {
    try {
      const response = await api.get('/invoices/society/my-invoices');
      const allInvoices = response.data || [];
      // Filter outstanding invoices
      const outstanding = allInvoices.filter(inv => {
        const outstanding = calculateOutstanding(inv);
        return outstanding > 0 && (inv.status === 'sent' || inv.status === 'overdue');
      });
      setOutstandingInvoices(outstanding);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // Fetch payments for this society's invoices
      const invoicesResponse = await api.get('/invoices/society/my-invoices');
      const invoices = invoicesResponse.data || [];
      const invoiceIds = invoices.map(inv => inv._id);
      
      // Get payments for these invoices
      const payments = [];
      for (const invoice of invoices) {
        if (invoice.payments && invoice.payments.length > 0) {
          for (const paymentId of invoice.payments) {
            try {
              const paymentResponse = await api.get(`/payments/${paymentId}`);
              payments.push(paymentResponse.data);
            } catch (error) {
              console.error('Error fetching payment:', error);
            }
          }
        }
      }
      
      payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setPaymentHistory(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const calculateOutstanding = (invoice) => {
    const paidAmount = invoice.payments?.reduce((sum, p) => {
      if (typeof p === 'object' && p.amount) {
        return sum + p.amount;
      }
      return sum;
    }, 0) || 0;
    return invoice.total - paidAmount;
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.invoiceId) {
      newErrors.invoiceId = 'Please select an invoice';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else {
      const selectedInv = outstandingInvoices.find(inv => inv._id === formData.invoiceId);
      if (selectedInv) {
        const outstanding = calculateOutstanding(selectedInv);
        if (parseFloat(formData.amount) > outstanding) {
          newErrors.amount = `Amount cannot exceed outstanding amount of ${outstanding}`;
        }
      }
    }
    
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
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

    setSubmitting(true);

    try {
      const selectedInv = outstandingInvoices.find(inv => inv._id === formData.invoiceId);
      if (!selectedInv) {
        throw new Error('Invoice not found');
      }

      // Create payment via vendor endpoint (society admin creates payment request)
      // Note: This might need a special endpoint for society admin
      const paymentData = {
        type: 'delivery',
        relatedTo: 'society',
        relatedId: selectedInv.relatedId, // Society ID
        invoiceId: formData.invoiceId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
        status: 'completed', // Society payments are considered completed
      };

      await api.post('/payments/society', paymentData);

      alert(t('society.paymentRecorded'));
      setShowPaymentForm(false);
      setFormData({
        invoiceId: '',
        amount: '',
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: '',
      });
      fetchOutstandingInvoices();
      fetchPaymentHistory();
    } catch (error) {
      console.error('Error recording payment:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to record payment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('society.payments')}</h1>
        <p className="text-gray-600 mt-1">{t('society.makePayments')}</p>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('society.recordPayment')}</h2>
            <button
              onClick={() => {
                setShowPaymentForm(false);
                setFormData({
                  invoiceId: '',
                  amount: '',
                  paymentMethod: 'cash',
                  paymentDate: new Date().toISOString().split('T')[0],
                  referenceNumber: '',
                  notes: '',
                });
                setSelectedInvoice(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{submitError}</span>
                </div>
              </div>
            )}

            {/* Invoice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('society.selectInvoice')} *
              </label>
              <select
                name="invoiceId"
                value={formData.invoiceId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.invoiceId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">{t('society.selectInvoice')}</option>
                {outstandingInvoices.map((invoice) => {
                  const outstanding = calculateOutstanding(invoice);
                  return (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - Outstanding: {formatCurrency(outstanding)}
                    </option>
                  );
                })}
              </select>
              {errors.invoiceId && (
                <p className="mt-1 text-sm text-red-600">{errors.invoiceId}</p>
              )}
            </div>

            {selectedInvoice && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('vendor.invoiceNumber')}:</span>
                    <span className="ml-2 font-medium">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.total')}:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('society.outstanding')}:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {formatCurrency(calculateOutstanding(selectedInvoice))}
                    </span>
                  </div>
                  {selectedInvoice.dueDate && (
                    <div>
                      <span className="text-gray-600">{t('vendor.dueDate')}:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <Input
                label={`${t('vendor.amount')} (₹) *`}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                error={errors.amount}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendor.paymentMethod')} *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                }`}
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
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <Input
                label={`${t('vendor.paymentDate')} *`}
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                error={errors.paymentDate}
              />
            </div>

            {/* Reference Number */}
            <div>
              <Input
                label={t('vendor.referenceNumber')}
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder={t('vendor.referenceNumberPlaceholder')}
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
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('society.paymentNotesPlaceholder')}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('society.recordPayment')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentForm(false);
                  setFormData({
                    invoiceId: '',
                    amount: '',
                    paymentMethod: 'cash',
                    paymentDate: new Date().toISOString().split('T')[0],
                    referenceNumber: '',
                    notes: '',
                  });
                  setSelectedInvoice(null);
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Outstanding Invoices */}
      {!showPaymentForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('society.outstandingInvoices')}</h2>
            <Button
              variant="primary"
              onClick={() => setShowPaymentForm(true)}
            >
              💳 {t('society.makePayment')}
            </Button>
          </div>

          {outstandingInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('society.noOutstandingInvoices')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outstandingInvoices.map((invoice) => {
                const outstanding = calculateOutstanding(invoice);
                return (
                  <div
                    key={invoice._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{invoice.invoiceNumber}</span>
                          <span className="text-xs text-gray-500">{formatDate(invoice.createdAt)}</span>
                        </div>
                        {invoice.period && (
                          <p className="text-sm text-gray-600 mb-1">
                            {formatDate(invoice.period.startDate)} - {formatDate(invoice.period.endDate)}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-600">
                            {t('vendor.total')}: <span className="font-medium">{formatCurrency(invoice.total)}</span>
                          </span>
                          <span className="text-orange-600">
                            {t('society.outstanding')}: <span className="font-medium">{formatCurrency(outstanding)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => navigate(`/society/invoices?invoiceId=${invoice._id}`)}
                        >
                          {t('vendor.viewDetails')}
                        </Button>
                        <Button
                          size="small"
                          variant="primary"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setFormData(prev => ({
                              ...prev,
                              invoiceId: invoice._id,
                              amount: outstanding.toString(),
                            }));
                            setShowPaymentForm(true);
                          }}
                        >
                          💳 {t('society.pay')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('society.paymentHistory')}</h2>

        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('society.noPayments')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.paymentDate')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.invoiceNumber')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('vendor.paymentMethod')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.invoiceId?.invoiceNumber || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.paymentMethod || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;

