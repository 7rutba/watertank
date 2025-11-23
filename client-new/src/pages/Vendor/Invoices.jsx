import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingState from '../../components/LoadingState';
import Card from '../../components/Card';
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

  const clearFilters = () => {
    setFilters({
      type: '',
      relatedTo: '',
      status: '',
      startDate: '',
      endDate: '',
    });
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

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      sent: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const filterConfig = [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'monthly', label: 'Monthly' },
      ],
    },
    {
      name: 'relatedTo',
      label: t('vendor.relatedTo'),
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'society', label: 'Society' },
      ],
    },
    {
      name: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ],
    },
    {
      name: 'startDate',
      label: t('vendor.startDate'),
      type: 'date',
    },
    {
      name: 'endDate',
      label: t('vendor.endDate'),
      type: 'date',
    },
  ];

  const tableColumns = [
    {
      key: 'invoiceNumber',
      label: t('vendor.invoiceNumber'),
      render: (row) => <span className="font-medium">{row.invoiceNumber}</span>,
    },
    {
      key: 'relatedTo',
      label: t('vendor.relatedTo'),
      render: (row) => (
        <div className="max-w-[120px] truncate" title={row.relatedId?.name || 'N/A'}>
          {row.relatedId?.name || 'N/A'}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      key: 'date',
      label: t('vendor.date'),
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'total',
      label: t('vendor.total'),
      align: 'right',
      render: (row) => formatCurrency(row.total || 0),
    },
    {
      key: 'paid',
      label: t('vendor.paid'),
      align: 'right',
      render: (row) => <span className="text-green-600">{formatCurrency(calculatePaid(row))}</span>,
    },
    {
      key: 'outstanding',
      label: t('vendor.outstanding'),
      align: 'right',
      render: (row) => {
        const outstanding = (row.total || 0) - calculatePaid(row);
        return <span className="text-red-600 font-medium">{formatCurrency(outstanding)}</span>;
      },
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (row) => (
        <div className="flex gap-1.5 flex-wrap min-w-[200px]">
          <Button
            size="small"
            variant="outline"
            onClick={() => openDetailsModal(row)}
            className="text-xs px-2 py-1"
          >
            View
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDownloadPDF(row._id, row.invoiceNumber)}
            className="text-xs px-2 py-1"
          >
            PDF
          </Button>
          {row.status === 'draft' && (
            <Button
              size="small"
              variant="primary"
              onClick={() => handleSendInvoice(row._id)}
              className="text-xs px-2 py-1"
            >
              Send
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && invoices.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('vendor.invoices')} />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + calculatePaid(inv), 0);
  const totalOutstanding = totalAmount - totalPaid;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full">
      {/* Page Header */}
      <PageHeader
        title={t('vendor.invoices')}
        subtitle="View and manage invoices"
        actions={
          <Button onClick={() => setShowGenerateModal(true)} variant="primary">
            {t('vendor.generateInvoice')}
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title={t('vendor.totalInvoices')}
          value={invoices.length}
          icon="📄"
          iconBg="bg-blue-500"
        />
        <StatsCard
          title={t('vendor.totalAmount')}
          value={formatCurrency(totalAmount)}
          icon="💰"
          iconBg="bg-green-500"
        />
        <StatsCard
          title={t('vendor.paid')}
          value={formatCurrency(totalPaid)}
          icon="✅"
          iconBg="bg-emerald-500"
        />
        <StatsCard
          title={t('vendor.outstanding')}
          value={formatCurrency(totalOutstanding)}
          icon="⚠️"
          iconBg="bg-red-500"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
        filterConfig={filterConfig}
      />

      {/* Invoices Table - Desktop View */}
      <div className="hidden lg:block w-full">
        <div className="w-full overflow-x-auto">
          <DataTable
            columns={tableColumns}
            data={invoices}
            loading={loading}
            emptyMessage={t('vendor.noInvoices')}
          />
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden">
        {loading ? (
          <Card>
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          </Card>
        ) : invoices.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="text-gray-500">{t('vendor.noInvoices')}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const paid = calculatePaid(invoice);
              const outstanding = (invoice.total || 0) - paid;
              return (
                <Card key={invoice._id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                      <div>{getStatusBadge(invoice.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 text-xs">{t('vendor.relatedTo')}:</span>
                        <div className="font-medium text-gray-900 capitalize">{invoice.relatedTo}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Name:</span>
                        <div className="font-medium text-gray-900">{invoice.relatedId?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">Type:</span>
                        <div className="font-medium text-gray-900 capitalize">{invoice.type}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">{t('vendor.total')}:</span>
                        <div className="font-medium text-gray-900">{formatCurrency(invoice.total || 0)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">{t('vendor.paid')}:</span>
                        <div className="font-medium text-green-600">{formatCurrency(paid)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs">{t('vendor.outstanding')}:</span>
                        <div className="font-medium text-red-600">{formatCurrency(outstanding)}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => openDetailsModal(invoice)}
                          className="text-xs flex-1 sm:flex-none"
                        >
                          {t('vendor.viewDetails')}
                        </Button>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                          className="text-xs flex-1 sm:flex-none"
                        >
                          📄 PDF
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => handleSendInvoice(invoice._id)}
                            className="text-xs flex-1 sm:flex-none"
                          >
                            {t('vendor.sendInvoice')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setGenerateForm({ relatedTo: 'society', relatedId: '', startDate: '', endDate: '' });
        }}
        title="Generate Invoice"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="primary"
              onClick={handleGenerateInvoice}
              disabled={generating}
              className="w-full sm:w-auto"
            >
              {generating ? t('common.loading') : t('vendor.generateInvoice')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowGenerateModal(false);
                setGenerateForm({ relatedTo: 'society', relatedId: '', startDate: '', endDate: '' });
              }}
              disabled={generating}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateInvoice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('vendor.relatedTo')} *
            </label>
            <select
              value={generateForm.relatedTo}
              onChange={(e) => setGenerateForm({ ...generateForm, relatedTo: e.target.value, relatedId: '' })}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            >
              <option value="society">Society</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {generateForm.relatedTo === 'society' ? t('vendor.selectSociety') : t('vendor.selectSupplier')} *
            </label>
            <select
              value={generateForm.relatedId}
              onChange={(e) => setGenerateForm({ ...generateForm, relatedId: e.target.value })}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              required
            >
              <option value="">Select...</option>
              {(generateForm.relatedTo === 'society' ? societies : suppliers).map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label={t('vendor.startDate')}
              value={generateForm.startDate}
              onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })}
              required
            />
            <Input
              type="date"
              label={t('vendor.endDate')}
              value={generateForm.endDate}
              onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}
        title={t('vendor.invoiceDetails')}
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="primary"
              onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice._id, selectedInvoice.invoiceNumber)}
              className="w-full sm:w-auto"
            >
              📄 {t('vendor.downloadPDF')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}
              className="w-full sm:w-auto"
            >
              {t('common.close')}
            </Button>
          </div>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.invoiceNumber')}:</span>
                <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('common.status')}:</span>
                <div>{getStatusBadge(selectedInvoice.status)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.relatedTo')}:</span>
                <p className="font-medium capitalize">{selectedInvoice.relatedTo}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">Name:</span>
                <p className="font-medium">{selectedInvoice.relatedId?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.subtotal')}:</span>
                <p className="font-medium">{formatCurrency(selectedInvoice.subtotal || 0)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.total')}:</span>
                <p className="font-medium text-lg text-primary">
                  {formatCurrency(selectedInvoice.total || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.paid')}:</span>
                <p className="font-medium text-green-600">
                  {formatCurrency(calculatePaid(selectedInvoice))}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">{t('vendor.outstanding')}:</span>
                <p className="font-medium text-red-600">
                  {formatCurrency((selectedInvoice.total || 0) - calculatePaid(selectedInvoice))}
                </p>
              </div>
            </div>
            
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('vendor.items')}</h3>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">{t('vendor.driver')}</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">{t('vendor.vehicle')}</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">{t('vendor.quantity')}</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">{t('vendor.rate')}</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">{t('vendor.amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">{formatDate(item.date)}</td>
                          <td className="px-4 py-3">{item.driverName || '-'}</td>
                          <td className="px-4 py-3">{item.vehicleNumber || '-'}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}L</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.rate || 0)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 text-xs">Date:</span>
                          <div className="font-medium">{formatDate(item.date)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">{t('vendor.quantity')}:</span>
                          <div className="font-medium">{item.quantity}L</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">{t('vendor.driver')}:</span>
                          <div className="font-medium">{item.driverName || '-'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">{t('vendor.rate')}:</span>
                          <div className="font-medium">{formatCurrency(item.rate || 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">{t('vendor.vehicle')}:</span>
                          <div className="font-medium">{item.vehicleNumber || '-'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">{t('vendor.amount')}:</span>
                          <div className="font-medium text-primary">{formatCurrency(item.amount || 0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
