import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Invoices = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    relatedTo: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    relatedTo: 'society',
    relatedId: '',
    startDate: '',
    endDate: '',
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchSocieties();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.relatedTo) params.append('relatedTo', filters.relatedTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/invoices?${params.toString()}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
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

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await api.post('/invoices/generate-monthly', generateForm);
      setShowGenerateModal(false);
      setGenerateForm({ relatedTo: 'society', relatedId: '', startDate: '', endDate: '' });
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}/send`);
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send invoice');
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      
      // Create blob URL and trigger download
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

  const openDetailsModal = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice._id}`);
      setSelectedInvoice(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const calculatePaid = (invoice) => {
    if (!invoice.payments || invoice.payments.length === 0) return 0;
    return invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.invoices')}</h1>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.invoices')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage invoices</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} variant="primary" className="w-full sm:w-auto">
          {t('vendor.generateInvoice')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="delivery">Delivery</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.relatedTo')}</label>
            <select
              name="relatedTo"
              value={filters.relatedTo}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All</option>
              <option value="supplier">Supplier</option>
              <option value="society">Society</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')}</label>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')}</label>
            <Input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalInvoices')}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{invoices.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalAmount')}</div>
          <div className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total || 0), 0))}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.paid')}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + calculatePaid(inv), 0))}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.outstanding')}</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total || 0) - calculatePaid(inv), 0))}
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.invoiceNumber')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.relatedTo')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.total')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.paid')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.outstanding')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {t('vendor.noInvoices')}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const paid = calculatePaid(invoice);
                  const outstanding = invoice.total - paid;
                  return (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.relatedId?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {invoice.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(invoice.total || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">
                        {formatCurrency(paid)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                        {formatCurrency(outstanding)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex gap-2 flex-wrap">
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
                            📄 {t('vendor.downloadPDF')}
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              size="small"
                              variant="primary"
                              onClick={() => handleSendInvoice(invoice._id)}
                            >
                              {t('vendor.sendInvoice')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('vendor.generateMonthlyInvoice')}</h2>
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.relatedTo')} *</label>
                <select
                  value={generateForm.relatedTo}
                  onChange={(e) => setGenerateForm({ ...generateForm, relatedTo: e.target.value, relatedId: '' })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                >
                  <option value="society">Society</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {generateForm.relatedTo === 'society' ? t('vendor.selectSociety') : t('vendor.selectSupplier')} *
                </label>
                <select
                  value={generateForm.relatedId}
                  onChange={(e) => setGenerateForm({ ...generateForm, relatedId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Select...</option>
                  {(generateForm.relatedTo === 'society' ? societies : suppliers).map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')} *</label>
                  <Input
                    type="date"
                    value={generateForm.startDate}
                    onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')} *</label>
                  <Input
                    type="date"
                    value={generateForm.endDate}
                    onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={generating} className="flex-1">
                  {generating ? t('common.loading') : t('vendor.generateInvoice')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowGenerateModal(false); setGenerateForm({ relatedTo: 'society', relatedId: '', startDate: '', endDate: '' }); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('vendor.invoiceDetails')}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}
                className="text-gray-500 hover:text-gray-700"
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
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.relatedTo')}:</span>
                  <span className="ml-2 font-medium capitalize">{selectedInvoice.relatedTo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedInvoice.relatedId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.subtotal')}:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedInvoice.subtotal || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.total')}:</span>
                  <span className="ml-2 font-medium text-lg text-primary">{formatCurrency(selectedInvoice.total || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.paid')}:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(calculatePaid(selectedInvoice))}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.outstanding')}:</span>
                  <span className="ml-2 font-medium text-red-600">{formatCurrency((selectedInvoice.total || 0) - calculatePaid(selectedInvoice))}</span>
                </div>
              </div>
              
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t('vendor.items')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">{t('vendor.driver')}</th>
                          <th className="px-3 py-2 text-left">{t('vendor.vehicle')}</th>
                          <th className="px-3 py-2 text-right">{t('vendor.quantity')}</th>
                          <th className="px-3 py-2 text-right">{t('vendor.rate')}</th>
                          <th className="px-3 py-2 text-right">{t('vendor.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2">{formatDate(item.date)}</td>
                            <td className="px-3 py-2">{item.driverName || '-'}</td>
                            <td className="px-3 py-2">{item.vehicleNumber || '-'}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}L</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.rate || 0)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}>
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

