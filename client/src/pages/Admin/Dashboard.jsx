import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalSubscriptions: 0,
    revenue: 0,
    totalUsers: 0,
    totalVehicles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const vendorsRes = await api.get('/vendors');
      const vendorsData = vendorsRes.data || [];
      setVendors(vendorsData.slice(0, 5));

      const activeVendors = vendorsData.filter(v => v.isActive).length;
      const activeSubscriptions = vendorsData.filter(v => v.subscription?.isActive).length;

      setStats({
        totalVendors: vendorsData.length,
        activeVendors,
        totalSubscriptions: activeSubscriptions,
        revenue: activeSubscriptions * 5000,
        totalUsers: 0,
        totalVehicles: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.platformOverview') || 'Platform overview and analytics'}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/vendors')}>
          {t('admin.manageVendors') || 'Manage Vendors'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-6">
          <div className="text-4xl mb-2">🏢</div>
          <h3 className="text-sm text-gray-600 mb-2">{t('common.totalVendors') || 'Total Vendors'}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVendors}</p>
          <p className="text-sm text-gray-500 mt-1">{t('vendor.title') || 'Vendors'}</p>
        </Card>

        <Card className="text-center p-6">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-sm text-gray-600 mb-2">{t('common.activeVendors') || 'Active Vendors'}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.activeVendors}</p>
          <p className="text-sm text-gray-500 mt-1">{t('common.active') || 'Active'}</p>
        </Card>

        <Card className="text-center p-6">
          <div className="text-4xl mb-2">💳</div>
          <h3 className="text-sm text-gray-600 mb-2">{t('common.subscriptions') || 'Subscriptions'}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalSubscriptions}</p>
          <p className="text-sm text-gray-500 mt-1">{t('common.active') || 'Active'}</p>
        </Card>

        <Card className="text-center p-6">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="text-sm text-gray-600 mb-2">{t('common.platformRevenue') || 'Platform Revenue'}</h3>
          <p className="text-3xl font-bold text-blue-600">₹{stats.revenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('report.revenue')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/admin/vendors')}>
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('admin.vendors') || 'Vendors'}</h3>
          <p className="text-sm text-gray-600">{t('admin.manageAllVendors') || 'Manage all vendors'}</p>
        </Card>
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/admin/subscriptions')}>
          <div className="text-5xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('admin.subscriptions') || 'Subscriptions'}</h3>
          <p className="text-sm text-gray-600">{t('admin.manageSubscriptions') || 'Manage subscriptions'}</p>
        </Card>
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/admin/analytics')}>
          <div className="text-5xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('admin.analytics') || 'Analytics'}</h3>
          <p className="text-sm text-gray-600">{t('admin.viewAnalytics') || 'View platform analytics'}</p>
        </Card>
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/admin/settings')}>
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('admin.settings') || 'Settings'}</h3>
          <p className="text-sm text-gray-600">{t('admin.systemSettings') || 'System configuration'}</p>
        </Card>
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={() => navigate('/admin/support')}>
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('admin.support') || 'Support'}</h3>
          <p className="text-sm text-gray-600">{t('admin.supportTickets') || 'Support tickets'}</p>
        </Card>
      </div>

      <Card title={t('admin.recentVendors') || 'Recent Vendors'}>
        <div className="space-y-3">
          {vendors.length === 0 ? (
            <p className="text-center py-8 text-gray-500">{t('common.noData')}</p>
          ) : (
            <>
              {vendors.map((vendor) => (
                <div 
                  key={vendor._id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate('/admin/vendors')}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-600">{vendor.businessName}</h3>
                    <p className="text-sm text-gray-600">{vendor.ownerName}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vendor.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vendor.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vendor.subscription?.plan === 'premium'
                          ? 'bg-blue-100 text-blue-700'
                          : vendor.subscription?.plan === 'enterprise'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.subscription?.plan || 'Basic'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button variant="info" size="small" onClick={(e) => { e.stopPropagation(); navigate('/admin/vendors'); }}>
                      {t('common.view')}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => navigate('/admin/vendors')}>
                  {t('common.viewAll') || 'View All Vendors'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;

