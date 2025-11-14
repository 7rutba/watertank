import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
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
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('vendor.dashboard')}</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 sm:p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('vendor.dashboard')}</h1>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('vendor.dashboard')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Refresh data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('vendor.todayRevenue')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(stats.todayRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.todayDeliveries} {t('vendor.deliveries')}</p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
              <span className="text-xl sm:text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('vendor.monthlyProfit')}</p>
              <p className={`text-xl sm:text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.monthlyProfit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('vendor.revenue')}: {formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
              <span className="text-xl sm:text-2xl">📈</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('vendor.outstandingReceivables')}</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(stats.outstandingFromSocieties)}</p>
              <p className="text-xs text-gray-500 mt-1">{t('vendor.fromSocieties')}</p>
            </div>
            <div className="bg-orange-500 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
              <span className="text-xl sm:text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t('vendor.outstandingPayables')}</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(stats.outstandingToSuppliers)}</p>
              <p className="text-xs text-gray-500 mt-1">{t('vendor.toSuppliers')}</p>
            </div>
            <div className="bg-red-500 p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2">
              <span className="text-xl sm:text-2xl">💸</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Operations Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{formatNumber(stats.activeDrivers)}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">{t('vendor.activeDrivers')}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{formatNumber(stats.activeVehicles)}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">{t('vendor.activeVehicles')}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{formatNumber(stats.pendingExpenses)}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">{t('vendor.pendingExpenses')}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{formatNumber(stats.todayDeliveries)}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">{t('vendor.todayDeliveries')}</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t('vendor.quickActions')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {hasPermission('canManageDrivers') && (
            <button 
              onClick={() => navigate('/vendor/drivers')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">👨‍✈️</div>
              <div className="font-semibold">{t('vendor.manageDrivers')}</div>
              <div className="text-sm text-gray-600">Add and manage drivers</div>
            </button>
          )}
          {hasPermission('canManageVehicles') && (
            <button 
              onClick={() => navigate('/vendor/vehicles')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">🚛</div>
              <div className="font-semibold">{t('vendor.manageVehicles')}</div>
              <div className="text-sm text-gray-600">Manage your vehicles</div>
            </button>
          )}
          {hasPermission('canApproveExpenses') && (
            <button 
              onClick={() => navigate('/vendor/expenses')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">{t('vendor.reviewExpenses')}</div>
              <div className="text-sm text-gray-600">{stats.pendingExpenses} pending expenses</div>
            </button>
          )}
          {hasPermission('canManageInvoices') && (
            <button 
              onClick={() => navigate('/vendor/invoices')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">{t('vendor.generateInvoices')}</div>
              <div className="text-sm text-gray-600">Create monthly invoices</div>
            </button>
          )}
          {hasPermission('canGenerateReports') && (
            <button 
              onClick={() => navigate('/vendor/reports')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold">{t('vendor.viewReports')}</div>
              <div className="text-sm text-gray-600">View financial reports</div>
            </button>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title={t('vendor.recentActivity')}>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('common.noData')}</p>
            </div>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-lg">{activity.icon || '📋'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Amount: {formatCurrency(activity.amount)}
                    </p>
                  )}
                  {activity.status && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      activity.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.time).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

