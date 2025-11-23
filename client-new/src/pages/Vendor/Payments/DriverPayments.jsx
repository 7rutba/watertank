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

const DriverPayments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    status: 'approved',
    driverId: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [drivers, setDrivers] = useState([]);

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
      status: 'approved',
      driverId: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const handlePayExpense = async (expense) => {
    if (!confirm(`Pay ₹${expense.amount} to ${expense.driverId?.name || 'driver'}?`)) {
      return;
    }
    
    try {
      await api.post('/payments', {
        type: 'expense',
        relatedTo: 'driver',
        relatedId: expense.driverId._id,
        expenseId: expense._id,
        amount: expense.amount,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: `EXP-${expense._id}`,
        notes: `Payment for ${expense.category} expense`,
      });
      
      // Update expense status to paid
      await api.put(`/expenses/${expense._id}/approve`, {
        status: 'paid',
      });
      
      fetchExpenses();
      alert('Expense payment recorded successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
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

  const filterConfig = [
    {
      name: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { value: 'approved', label: 'Approved' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
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
      render: (row) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
          row.status === 'paid' ? 'bg-green-100 text-green-800' :
          row.status === 'approved' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (row) => (
        row.status === 'approved' ? (
          <Button
            size="small"
            variant="primary"
            onClick={() => handlePayExpense(row)}
          >
            Pay Now
          </Button>
        ) : (
          <span className="text-sm text-gray-500">Already Paid</span>
        )
      ),
    },
  ];

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Driver Payments" />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const totalPending = approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidExpenses = expenses.filter(e => e.status === 'paid');
  const totalPaid = paidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Driver Payments"
        subtitle="Pay approved driver expenses"
        actions={
          <Button onClick={() => navigate('/vendor/expenses')} variant="outline">
            Review Expenses
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Pending Payments"
          value={approvedExpenses.length}
          icon="⏳"
          iconBg="bg-yellow-500"
        />
        <StatsCard
          title="Total Pending Amount"
          value={formatCurrency(totalPending)}
          icon="💰"
          iconBg="bg-orange-500"
        />
        <StatsCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon="✅"
          iconBg="bg-green-500"
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
        emptyMessage="No expenses found"
      />
    </div>
  );
};

export default DriverPayments;

