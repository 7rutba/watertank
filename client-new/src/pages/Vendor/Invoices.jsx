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
      render: (row) => row.relatedId?.name || 'N/A',
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
        <div className="flex gap-2 flex-wrap">
          <Button
            size="small"
            variant="outline"
            onClick={() => openDetailsModal(row)}
          >
            {t('vendor.viewDetails')}
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDownloadPDF(row._id, row.invoiceNumber)}
          >
            📄 PDF
          </Button>
          {row.status === 'draft' && (
            <Button
              size="small"
              variant="primary"
              onClick={() => handleSendInvoice(row._id)}
            >
              {t('vendor.sendInvoice')}
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
    <div className="space-y-6 sm:space-y-8">
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

      {/* Invoices Table */}
      <DataTable
        columns={tableColumns}
        data={invoices}
        loading={loading}
        emptyMessage={t('vendor.noInvoices')}
      />

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
          <>
            <Button
              variant="primary"
              onClick={handleGenerateInvoice}
              disabled={generating}
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
            >
              {t('common.cancel')}
            </Button>
          </>
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
          
          <div className="grid grid-cols-2 gap-4">
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
          <>
            <Button
              variant="primary"
              onClick={() => selectedInvoice && handleDownloadPDF(selectedInvoice._id, selectedInvoice.invoiceNumber)}
            >
              📄 {t('vendor.downloadPDF')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowDetailsModal(false); setSelectedInvoice(null); }}
            >
              {t('common.close')}
            </Button>
          </>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">{t('vendor.invoiceNumber')}:</span>
                <p className="font-medium mt-1">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('common.status')}:</span>
                <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.relatedTo')}:</span>
                <p className="font-medium mt-1 capitalize">{selectedInvoice.relatedTo}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-medium mt-1">{selectedInvoice.relatedId?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.subtotal')}:</span>
                <p className="font-medium mt-1">{formatCurrency(selectedInvoice.subtotal || 0)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.total')}:</span>
                <p className="font-medium text-lg text-primary mt-1">
                  {formatCurrency(selectedInvoice.total || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.paid')}:</span>
                <p className="font-medium text-green-600 mt-1">
                  {formatCurrency(calculatePaid(selectedInvoice))}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.outstanding')}:</span>
                <p className="font-medium text-red-600 mt-1">
                  {formatCurrency((selectedInvoice.total || 0) - calculatePaid(selectedInvoice))}
                </p>
              </div>
            </div>
            
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('vendor.items')}</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
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
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
