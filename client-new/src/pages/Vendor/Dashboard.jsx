import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import usePermissions from '../../hooks/usePermissions';
import api from '../../utils/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayDeliveries: 0,
    monthlyRevenue: 0,
    monthlyCosts: 0,
    monthlyProfit: 0,
    outstandingFromSocieties: 0,
    outstandingToSuppliers: 0,
    activeDrivers: 0,
    activeVehicles: 0,
    pendingExpenses: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/vendor/dashboard/stats'),
        api.get('/vendor/dashboard/recent-activity?limit=10'),
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('vendor.dashboard')} />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('vendor.dashboard')} />
        <Card>
          <EmptyState
            icon="⚠️"
            title="Error Loading Dashboard"
            message={error}
            action={
              <Button onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title={t('vendor.dashboard')}
        subtitle="Welcome back! Here's your business overview."
        actions={
          <Button
            variant="outline"
            size="small"
            onClick={fetchDashboardData}
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title={t('vendor.todayRevenue')}
          value={formatCurrency(stats.todayRevenue)}
          subtitle={`${stats.todayDeliveries} ${t('vendor.deliveries')}`}
          icon="💰"
          iconBg="bg-green-500"
        />
        <StatsCard
          title={t('vendor.monthlyProfit')}
          value={formatCurrency(stats.monthlyProfit)}
          subtitle={`${t('vendor.revenue')}: ${formatCurrency(stats.monthlyRevenue)}`}
          icon="📈"
          iconBg={stats.monthlyProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}
        />
        <StatsCard
          title={t('vendor.outstandingReceivables')}
          value={formatCurrency(stats.outstandingFromSocieties)}
          subtitle={t('vendor.fromSocieties')}
          icon="📋"
          iconBg="bg-orange-500"
        />
        <StatsCard
          title={t('vendor.outstandingPayables')}
          value={formatCurrency(stats.outstandingToSuppliers)}
          subtitle={t('vendor.toSuppliers')}
          icon="💸"
          iconBg="bg-red-500"
        />
      </div>

      {/* Operations Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <Card className="text-center p-6">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {formatNumber(stats.activeDrivers)}
          </div>
          <div className="text-sm sm:text-base text-gray-600">
            {t('vendor.activeDrivers')}
          </div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {formatNumber(stats.activeVehicles)}
          </div>
          <div className="text-sm sm:text-base text-gray-600">
            {t('vendor.activeVehicles')}
          </div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">
            {formatNumber(stats.pendingExpenses)}
          </div>
          <div className="text-sm sm:text-base text-gray-600">
            {t('vendor.pendingExpenses')}
          </div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
            {formatNumber(stats.todayDeliveries)}
          </div>
          <div className="text-sm sm:text-base text-gray-600">
            {t('vendor.todayDeliveries')}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t('vendor.quickActions')} padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasPermission('canManageDrivers') && (
            <button 
              onClick={() => navigate('/vendor/drivers')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">👨‍✈️</div>
              <div className="font-semibold text-gray-900 mb-1">{t('vendor.manageDrivers')}</div>
              <div className="text-sm text-gray-600">Add and manage drivers</div>
            </button>
          )}
          {hasPermission('canManageVehicles') && (
            <button 
              onClick={() => navigate('/vendor/vehicles')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🚛</div>
              <div className="font-semibold text-gray-900 mb-1">{t('vendor.manageVehicles')}</div>
              <div className="text-sm text-gray-600">Manage your vehicles</div>
            </button>
          )}
          {hasPermission('canApproveExpenses') && (
            <button 
              onClick={() => navigate('/vendor/expenses')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💰</div>
              <div className="font-semibold text-gray-900 mb-1">{t('vendor.reviewExpenses')}</div>
              <div className="text-sm text-gray-600">{stats.pendingExpenses} pending expenses</div>
            </button>
          )}
          {hasPermission('canManageInvoices') && (
            <button 
              onClick={() => navigate('/vendor/invoices')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📄</div>
              <div className="font-semibold text-gray-900 mb-1">{t('vendor.generateInvoices')}</div>
              <div className="text-sm text-gray-600">Create monthly invoices</div>
            </button>
          )}
          {hasPermission('canGenerateReports') && (
            <button 
              onClick={() => navigate('/vendor/reports')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary-light transition-all text-left group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📈</div>
              <div className="font-semibold text-gray-900 mb-1">{t('vendor.viewReports')}</div>
              <div className="text-sm text-gray-600">View financial reports</div>
            </button>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title={t('vendor.recentActivity')} padding="lg">
        {recentActivities.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No recent activity"
            message="Your recent activities will appear here."
          />
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xl">{activity.icon || '📋'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 mb-1">{activity.action}</p>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-sm text-green-600 font-medium mb-2">
                      Amount: {formatCurrency(activity.amount)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    {activity.status && (
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                        activity.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
