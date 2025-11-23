import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import StatsCard from '../../../components/StatsCard';
import FilterBar from '../../../components/FilterBar';
import DataTable from '../../../components/DataTable';
import Button from '../../../components/Button';
import LoadingState from '../../../components/LoadingState';
import api from '../../../utils/api';

const AllPayments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    relatedTo: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.relatedTo) params.append('relatedTo', filters.relatedTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: t('vendor.cash'),
      bank_transfer: t('vendor.bankTransfer'),
      upi: t('vendor.upi'),
      cheque: t('vendor.cheque'),
      card: t('vendor.card'),
      neft: t('vendor.neft'),
      rtgs: t('vendor.rtgs'),
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const filterConfig = [
    {
      name: 'type',
      label: t('vendor.paymentType'),
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'expense', label: 'Expense' },
        { value: 'other', label: 'Other' },
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
        { value: 'driver', label: 'Driver' },
      ],
    },
    {
      name: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
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
      key: 'paymentDate',
      label: t('vendor.date'),
      render: (row) => formatDate(row.paymentDate),
    },
    {
      key: 'type',
      label: t('vendor.paymentType'),
      render: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      key: 'relatedTo',
      label: t('vendor.relatedTo'),
      render: (row) => <span className="capitalize">{row.relatedTo}</span>,
    },
    {
      key: 'paymentMethod',
      label: t('vendor.paymentMethod'),
      render: (row) => getPaymentMethodLabel(row.paymentMethod),
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
      key: 'referenceNumber',
      label: t('vendor.referenceNumber'),
      render: (row) => row.referenceNumber || '-',
    },
  ];

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="All Payments" />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="All Payments"
        subtitle="View and manage all payment transactions"
        actions={
          <Button onClick={() => navigate('/vendor/payments/record')} variant="primary">
            Record Payment
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Payments"
          value={payments.length}
          icon="📋"
          iconBg="bg-blue-500"
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon="💰"
          iconBg="bg-green-500"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon="✅"
          iconBg="bg-emerald-500"
        />
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon="⏳"
          iconBg="bg-yellow-500"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
        filterConfig={filterConfig}
      />

      {/* Payments Table */}
      <DataTable
        columns={tableColumns}
        data={payments}
        loading={loading}
        emptyMessage="No payments found"
      />
    </div>
  );
};

export default AllPayments;

