import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

const Invoices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices/society/my-invoices');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (filters.status) {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(inv => new Date(inv.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(inv => new Date(inv.createdAt) <= endDate);
    }

    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  const openDetailsModal = async (invoice) => {
    try {
      const response = await api.get(`/invoices/society/${invoice._id}`);
      setSelectedInvoice(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Failed to load invoice details');
    }
  };

  const closeDetailsModal = () => {
    setSelectedInvoice(null);
    setShowDetailsModal(false);
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(error.response?.data?.message || 'Failed to download PDF');
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

  // Calculate outstanding amount
  const calculateOutstanding = (invoice) => {
    const paidAmount = invoice.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return invoice.total - paidAmount;
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('society.invoices')}</h1>
        <p className="text-gray-600 mt-1">{t('society.viewAllInvoices')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('common.filter')}</h2>
          <Button
            variant="outline"
            size="small"
            onClick={resetFilters}
          >
            {t('common.reset')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.status')}
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{t('driver.all')}</option>
              <option value="sent">{t('society.sent')}</option>
              <option value="paid">{t('society.paid')}</option>
              <option value="overdue">{t('society.overdue')}</option>
            </select>
          </div>
          <div>
            <Input
              label={t('driver.startDate')}
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <Input
              label={t('driver.endDate')}
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalInvoices')}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{filteredInvoices.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalOutstanding')}</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(
              filteredInvoices.reduce((sum, inv) => sum + calculateOutstanding(inv), 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">{t('society.totalPaid')}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(
              filteredInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + (inv.total || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">{t('society.noInvoices')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.invoiceNumber')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('driver.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.period')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.total')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('society.outstanding')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.dueDate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const outstanding = calculateOutstanding(invoice);
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.period
                          ? `${formatDate(invoice.period.startDate)} - ${formatDate(invoice.period.endDate)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">
                        {formatCurrency(outstanding)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : invoice.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => openDetailsModal(invoice)}
                          >
                            {t('vendor.viewDetails')}
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                          >
                            📄 PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('society.invoiceDetails')}</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('vendor.invoiceNumber')}:</span>
                  <span className="ml-2 font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('driver.date')}:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedInvoice.createdAt)}</span>
                </div>
                {selectedInvoice.period && (
                  <>
                    <div>
                      <span className="text-gray-600">{t('vendor.period')}:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(selectedInvoice.period.startDate)} - {formatDate(selectedInvoice.period.endDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('vendor.dueDate')}:</span>
                      <span className="ml-2 font-medium">
                        {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : '-'}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedInvoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : selectedInvoice.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t('vendor.items')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('driver.date')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('driver.quantity')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('vendor.rate')}</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('vendor.amount')}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{formatDate(item.date)}</td>
                            <td className="px-4 py-2 text-sm">{item.quantity}L</td>
                            <td className="px-4 py-2 text-sm">₹{item.rate}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('vendor.subtotal')}:</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.tax')}:</span>
                        <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
                      </div>
                    )}
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.discount')}:</span>
                        <span className="font-medium">-{formatCurrency(selectedInvoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>{t('vendor.total')}:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    {calculateOutstanding(selectedInvoice) > 0 && (
                      <div className="flex justify-between text-orange-600 font-semibold">
                        <span>{t('society.outstanding')}:</span>
                        <span>{formatCurrency(calculateOutstanding(selectedInvoice))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t('society.paymentHistory')}</h3>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                        {payment.method && (
                          <p className="text-xs text-gray-500 mt-1">{t('vendor.paymentMethod')}: {payment.method}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="primary"
                onClick={() => handleDownloadPDF(selectedInvoice._id, selectedInvoice.invoiceNumber)}
              >
                📄 {t('vendor.downloadPDF')}
              </Button>
              {calculateOutstanding(selectedInvoice) > 0 && (
                <Button
                  variant="primary"
                  onClick={() => {
                    closeDetailsModal();
                    // Navigate to payments page with invoice pre-selected
                    navigate(`/society/payments?invoiceId=${selectedInvoice._id}`);
                  }}
                >
                  💳 {t('society.makePayment')}
                </Button>
              )}
              <Button variant="outline" onClick={closeDetailsModal}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

