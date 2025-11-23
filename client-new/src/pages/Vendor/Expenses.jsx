import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import FilterBar from '../../components/FilterBar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';

const Expenses = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filters, setFilters] = useState({
    status: 'pending',
    driverId: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      status: 'pending',
      driverId: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleApprove = async (expenseId, status) => {
    try {
      setApproving(true);
      await api.put(`/expenses/${expenseId}/approve`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      });
      setShowApproveModal(false);
      setSelectedExpense(null);
      setRejectionReason('');
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setApproving(false);
    }
  };

  const openDetailsModal = async (expense) => {
    try {
      const response = await api.get(`/expenses/${expense._id}`);
      setSelectedExpense(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  };

  const openApproveModal = (expense) => {
    setSelectedExpense(expense);
    setShowApproveModal(true);
    setRejectionReason('');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      fuel: t('vendor.fuel'),
      toll: t('vendor.toll'),
      maintenance: t('vendor.maintenance'),
      food: t('vendor.food'),
      medical: t('vendor.medical'),
      personal: t('vendor.personal'),
      other: t('vendor.other'),
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const filterConfig = [
    {
      name: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'paid', label: 'Paid' },
      ],
    },
    {
      name: 'driverId',
      label: t('vendor.driver'),
      type: 'select',
      options: [
        { value: '', label: 'All Drivers' },
        ...drivers.map(d => ({ value: d._id, label: d.name })),
      ],
    },
    {
      name: 'category',
      label: t('vendor.category'),
      type: 'select',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'fuel', label: t('vendor.fuel') },
        { value: 'toll', label: t('vendor.toll') },
        { value: 'maintenance', label: t('vendor.maintenance') },
        { value: 'food', label: t('vendor.food') },
        { value: 'medical', label: t('vendor.medical') },
        { value: 'personal', label: t('vendor.personal') },
        { value: 'other', label: t('vendor.other') },
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
      key: 'expenseDate',
      label: t('vendor.date'),
      render: (row) => formatDate(row.expenseDate),
    },
    {
      key: 'driverId',
      label: t('vendor.driver'),
      render: (row) => row.driverId?.name || 'N/A',
    },
    {
      key: 'category',
      label: t('vendor.category'),
      render: (row) => getCategoryLabel(row.category),
    },
    {
      key: 'description',
      label: t('vendor.description'),
      render: (row) => (
        <div className="max-w-xs truncate" title={row.description || '-'}>
          {row.description || '-'}
        </div>
      ),
    },
    {
      key: 'amount',
      label: t('vendor.amount'),
      align: 'right',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.amount || 0)}</span>
      ),
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
        <div className="flex gap-2">
          <Button
            size="small"
            variant="outline"
            onClick={() => openDetailsModal(row)}
          >
            {t('vendor.viewDetails')}
          </Button>
          {row.status === 'pending' && (
            <Button
              size="small"
              variant="primary"
              onClick={() => openApproveModal(row)}
            >
              {t('vendor.review')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('vendor.expenses')} />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const totalPending = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title={t('vendor.expenses')}
        subtitle="Review and approve driver expenses"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title={t('vendor.pendingExpenses')}
          value={pendingExpenses.length}
          icon="⏳"
          iconBg="bg-yellow-500"
        />
        <StatsCard
          title={t('vendor.totalPendingAmount')}
          value={formatCurrency(totalPending)}
          icon="💰"
          iconBg="bg-orange-500"
        />
        <StatsCard
          title={t('vendor.totalExpenses')}
          value={expenses.length}
          icon="📊"
          iconBg="bg-blue-500"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
        filterConfig={filterConfig}
      />

      {/* Expenses Table */}
      <DataTable
        columns={tableColumns}
        data={expenses}
        loading={loading}
        emptyMessage={t('vendor.noExpenses')}
      />

      {/* Expense Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedExpense(null); }}
        title={t('vendor.expenseDetails')}
        size="md"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">{t('vendor.date')}:</span>
                <p className="font-medium mt-1">{formatDate(selectedExpense.expenseDate)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('common.status')}:</span>
                <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.driver')}:</span>
                <p className="font-medium mt-1">{selectedExpense.driverId?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.category')}:</span>
                <p className="font-medium mt-1">{getCategoryLabel(selectedExpense.category)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.amount')}:</span>
                <p className="font-medium text-lg text-primary mt-1">
                  {formatCurrency(selectedExpense.amount || 0)}
                </p>
              </div>
              {selectedExpense.approvedBy && (
                <div>
                  <span className="text-sm text-gray-600">Approved By:</span>
                  <p className="font-medium mt-1">{selectedExpense.approvedBy?.name || 'N/A'}</p>
                </div>
              )}
            </div>
            
            {selectedExpense.description && (
              <div>
                <span className="text-sm text-gray-600">{t('vendor.description')}:</span>
                <p className="mt-2 text-gray-900">{selectedExpense.description}</p>
              </div>
            )}
            
            {selectedExpense.rejectionReason && (
              <div>
                <span className="text-sm text-gray-600">Rejection Reason:</span>
                <p className="mt-2 text-red-800">{selectedExpense.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => { setShowDetailsModal(false); setSelectedExpense(null); }}
          >
            {t('common.close')}
          </Button>
        </div>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => { setShowApproveModal(false); setSelectedExpense(null); setRejectionReason(''); }}
        title={t('vendor.reviewExpense')}
        size="md"
        footer={
          <>
            <Button
              variant="primary"
              onClick={() => handleApprove(selectedExpense?._id, 'approved')}
              disabled={approving}
            >
              {t('vendor.approve')}
            </Button>
            <Button
              variant="danger"
              onClick={() => handleApprove(selectedExpense?._id, 'rejected')}
              disabled={approving || !rejectionReason}
            >
              {t('vendor.reject')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowApproveModal(false); setSelectedExpense(null); setRejectionReason(''); }}
              disabled={approving}
            >
              {t('common.cancel')}
            </Button>
          </>
        }
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">{t('vendor.driver')}:</span>
                <p className="font-medium mt-1">{selectedExpense.driverId?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.category')}:</span>
                <p className="font-medium mt-1">{getCategoryLabel(selectedExpense.category)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.amount')}:</span>
                <p className="font-medium text-lg text-primary mt-1">
                  {formatCurrency(selectedExpense.amount || 0)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('vendor.date')}:</span>
                <p className="font-medium mt-1">{formatDate(selectedExpense.expenseDate)}</p>
              </div>
            </div>
            
            {selectedExpense.description && (
              <div>
                <span className="text-sm text-gray-600">{t('vendor.description')}:</span>
                <p className="mt-2 text-gray-900">{selectedExpense.description}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Expenses;
