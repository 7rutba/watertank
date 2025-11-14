import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, subMonths, subYears, startOfYear } from 'date-fns';
import api from '../../../utils/api';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Overview data
  const [overview, setOverview] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalUsers: 0,
    usersByRole: {},
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    platformGrowthRate: 0,
  });

  // Chart data
  const [revenueData, setRevenueData] = useState([]);
  const [vendorsGrowthData, setVendorsGrowthData] = useState([]);
  const [usersGrowthData, setUsersGrowthData] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState({ distribution: {}, totalRevenue: 0, averageRevenue: 0 });
  const [transactionsData, setTransactionsData] = useState([]);
  const [revenueByVendorData, setRevenueByVendorData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [period, startDate, endDate]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAllData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, period, startDate, endDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [
        overviewRes,
        revenueRes,
        vendorsGrowthRes,
        usersGrowthRes,
        subscriptionsRes,
        transactionsRes,
        revenueByVendorRes,
      ] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get(`/admin/analytics/revenue?${params}`),
        api.get(`/admin/analytics/vendors-growth?${params}`),
        api.get(`/admin/analytics/users-growth?${params}`),
        api.get('/admin/analytics/subscriptions-stats'),
        api.get(`/admin/analytics/transactions?${params}`),
        api.get(`/admin/analytics/revenue-by-vendor?${params}&limit=10`),
      ]);

      setOverview(overviewRes.data);
      setRevenueData(revenueRes.data.data || []);
      setVendorsGrowthData(vendorsGrowthRes.data.data || []);
      setUsersGrowthData(usersGrowthRes.data.data || []);
      setSubscriptionsData(subscriptionsRes.data);
      setTransactionsData(transactionsRes.data.data || []);
      setRevenueByVendorData(revenueByVendorRes.data.vendors || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setStartDate('');
    setEndDate('');
  };

  const handleQuickFilter = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setPeriod('');
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportToCSV = () => {
    // Simple CSV export for revenue data
    const csv = [
      ['Date', 'Revenue', 'Count'],
      ...revenueData.map(item => [item.date, item.revenue, item.count]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-revenue-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print()
    window.print();
  };

  if (loading && !overview.totalVendors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Prepare subscriptions pie chart data
  const subscriptionsPieData = Object.entries(subscriptionsData.distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.analytics')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.platformInsights')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ ' : '▶️ '} {autoRefresh ? t('admin.pauseRefresh') : t('admin.autoRefresh')}
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={fetchAllData}
          >
            🔄 {t('common.refresh')}
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={exportToCSV}
          >
            📊 CSV
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={exportToPDF}
          >
            📄 PDF
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="mb-4 text-sm text-gray-500">
          {t('admin.lastUpdated')}: {format(lastUpdated, 'PPpp')}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.timePeriod')}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="small"
                variant={period === 'daily' ? 'primary' : 'outline'}
                onClick={() => handlePeriodChange('daily')}
              >
                {t('admin.daily')}
              </Button>
              <Button
                size="small"
                variant={period === 'weekly' ? 'primary' : 'outline'}
                onClick={() => handlePeriodChange('weekly')}
              >
                {t('admin.weekly')}
              </Button>
              <Button
                size="small"
                variant={period === 'monthly' ? 'primary' : 'outline'}
                onClick={() => handlePeriodChange('monthly')}
              >
                {t('admin.monthly')}
              </Button>
              <Button
                size="small"
                variant={period === 'yearly' ? 'primary' : 'outline'}
                onClick={() => handlePeriodChange('yearly')}
              >
                {t('admin.yearly')}
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.quickFilters')}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="small"
                variant="outline"
                onClick={() => handleQuickFilter(7)}
              >
                {t('admin.last7Days')}
              </Button>
              <Button
                size="small"
                variant="outline"
                onClick={() => handleQuickFilter(30)}
              >
                {t('admin.last30Days')}
              </Button>
              <Button
                size="small"
                variant="outline"
                onClick={() => handleQuickFilter(90)}
              >
                {t('admin.last90Days')}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('admin.startDate')}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={t('admin.endDate')}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('admin.totalVendors')}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{overview.totalVendors}</p>
              <p className="text-xs text-blue-700 mt-1">
                {overview.activeVendors} {t('admin.active')}
              </p>
            </div>
            <span className="text-3xl">🏢</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('admin.totalUsers')}</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{overview.totalUsers}</p>
              <p className="text-xs text-green-700 mt-1">
                {overview.platformGrowthRate > 0 ? '+' : ''}{overview.platformGrowthRate}% {t('admin.growth')}
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">{t('admin.totalRevenue')}</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{formatCurrency(overview.totalRevenue)}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('admin.activeSubscriptions')}</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{overview.activeSubscriptions}</p>
              <p className="text-xs text-purple-700 mt-1">
                {formatCurrency(subscriptionsData.totalRevenue)} {t('admin.total')}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trends */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.revenueTrends')}</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>

        {/* Vendor Growth */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.vendorGrowth')}</h2>
          {vendorsGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="newVendors" fill="#10B981" name={t('admin.newVendors')} />
                <Bar dataKey="totalVendors" fill="#3B82F6" name={t('admin.totalVendors')} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.userGrowth')}</h2>
          {usersGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usersGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(usersGrowthData[0] || {}).filter(key => key !== 'date').map((role, index) => (
                  <Line
                    key={role}
                    type="monotone"
                    dataKey={role}
                    stroke={COLORS[index % COLORS.length]}
                    name={role}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.subscriptionDistribution')}</h2>
          {subscriptionsPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionsPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>

        {/* Transaction Volume */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.transactionVolume')}</h2>
          {transactionsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="collections" stackId="1" stroke="#3B82F6" fill="#3B82F6" name={t('admin.collections')} />
                <Area type="monotone" dataKey="deliveries" stackId="1" stroke="#10B981" fill="#10B981" name={t('admin.deliveries')} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>

        {/* Revenue by Vendor */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.revenueByVendor')}</h2>
          {revenueByVendorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByVendorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="vendorName" type="category" width={150} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#F59E0B" name={t('admin.revenue')} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              {t('admin.noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

