import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import usePermissions from '../../hooks/usePermissions';
import { SUPER_ADMIN_PERMISSIONS } from '../../utils/permissions';
import api from '../../utils/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalUsers: 0,
    totalRevenue: 0,
    growth: {
      vendors: '0',
      activeVendors: '0',
      revenue: '0',
      users: '0',
    },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStats, setSystemStats] = useState({
    platformUptime: '99.9%',
    activeSessions: 0,
    apiRequestsToday: 0,
    storageUsed: '45%',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsResponse, activitiesResponse, systemStatsResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-activity?limit=10'),
        api.get('/admin/dashboard/system-stats'),
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
      setSystemStats(systemStatsResponse.data);
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

  const displayStats = [
    {
      title: t('admin.totalVendors'),
      value: formatNumber(stats.totalVendors),
      change: `+${stats.growth.vendors}%`,
      icon: '🏢',
      color: 'bg-blue-500',
    },
    {
      title: t('admin.activeVendors'),
      value: formatNumber(stats.activeVendors),
      change: `+${stats.growth.activeVendors}%`,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: t('admin.totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      change: `+${stats.growth.revenue}%`,
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: t('admin.totalUsers'),
      value: formatNumber(stats.totalUsers),
      change: `+${stats.growth.users}%`,
      icon: '👥',
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.dashboard')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.dashboard')}</h1>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.dashboard')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayStats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title={t('admin.quickActions')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_CREATE_VENDORS) && (
            <button 
              onClick={() => navigate('/admin/vendors')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold">{t('admin.addVendor')}</div>
              <div className="text-sm text-gray-600">Add a new vendor to the platform</div>
            </button>
          )}
          {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_VIEW_ALL_VENDORS) && (
            <button 
              onClick={() => navigate('/admin/vendors')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">{t('admin.viewAllVendors')}</div>
              <div className="text-sm text-gray-600">View and manage all vendors</div>
            </button>
          )}
          {hasPermission(SUPER_ADMIN_PERMISSIONS.CAN_VIEW_PLATFORM_ANALYTICS) && (
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary-light transition-colors text-left"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold">{t('admin.analytics')}</div>
              <div className="text-sm text-gray-600">View detailed analytics</div>
            </button>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title={t('admin.recentActivity')}>
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
                    <p className="text-sm text-gray-600">{activity.vendor}</p>
                    {activity.amount && (
                      <p className="text-sm text-green-600 font-medium">Amount: {formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={t('admin.systemStats')}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform Uptime</span>
              <span className="font-semibold">{systemStats.platformUptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Sessions</span>
              <span className="font-semibold">{formatNumber(systemStats.activeSessions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Requests (Today)</span>
              <span className="font-semibold">{formatNumber(systemStats.apiRequestsToday)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-semibold">{systemStats.storageUsed}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

