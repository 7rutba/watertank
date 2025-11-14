import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCollections: 0,
    todayDeliveries: 0,
    todayRevenue: 0,
    pendingExpenses: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      try {
        const statsResponse = await api.get('/driver/dashboard/stats');
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback: Calculate stats from collections/deliveries
        await fetchStatsFallback();
      }

      // Fetch recent trips
      try {
        const tripsResponse = await api.get('/driver/dashboard/recent-trips?limit=10');
        setRecentTrips(tripsResponse.data);
      } catch (error) {
        console.error('Error fetching recent trips:', error);
        // Fallback: Fetch from collections/deliveries
        await fetchTripsFallback();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsFallback = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's collections
      const collectionsResponse = await api.get('/collections', {
        params: {
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
        },
      });
      const todayCollections = collectionsResponse.data.length || 0;

      // Fetch today's deliveries
      const deliveriesResponse = await api.get('/deliveries', {
        params: {
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
        },
      });
      const todayDeliveries = deliveriesResponse.data.length || 0;
      const todayRevenue = deliveriesResponse.data.reduce(
        (sum, d) => sum + (d.totalAmount || 0),
        0
      );

      // Fetch pending expenses
      const expensesResponse = await api.get('/expenses', {
        params: { status: 'pending' },
      });
      const pendingExpenses = expensesResponse.data.length || 0;

      setStats({
        todayCollections,
        todayDeliveries,
        todayRevenue,
        pendingExpenses,
      });
    } catch (error) {
      console.error('Error in fallback stats:', error);
    }
  };

  const fetchTripsFallback = async () => {
    try {
      const [collectionsResponse, deliveriesResponse] = await Promise.all([
        api.get('/collections?limit=5'),
        api.get('/deliveries?limit=5'),
      ]);

      const trips = [];

      collectionsResponse.data.forEach((c) => {
        trips.push({
          id: c._id,
          type: 'collection',
          date: c.createdAt,
          location: c.location,
          quantity: c.quantity,
          amount: c.totalAmount,
          status: c.status,
          supplier: c.supplierId?.name,
          vehicle: c.vehicleId?.vehicleNumber,
        });
      });

      deliveriesResponse.data.forEach((d) => {
        trips.push({
          id: d._id,
          type: 'delivery',
          date: d.createdAt,
          location: d.location,
          quantity: d.quantity,
          amount: d.totalAmount,
          status: d.status,
          society: d.societyId?.name,
          vehicle: d.vehicleId?.vehicleNumber,
        });
      });

      trips.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentTrips(trips.slice(0, 10));
    } catch (error) {
      console.error('Error in fallback trips:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('driver.dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('driver.welcomeMessage')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('driver.todayCollections')}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.todayCollections}</p>
            </div>
            <span className="text-3xl">💧</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('driver.todayDeliveries')}</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.todayDeliveries}</p>
            </div>
            <span className="text-3xl">🚚</span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">{t('driver.todayRevenue')}</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <span className="text-3xl">💵</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">{t('driver.pendingExpenses')}</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.pendingExpenses}</p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('driver.quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => navigate('/driver/collection')}
            className="w-full py-3 text-lg"
          >
            💧 {t('driver.logCollection')}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/driver/delivery')}
            className="w-full py-3 text-lg"
          >
            🚚 {t('driver.logDelivery')}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/driver/expense')}
            className="w-full py-3 text-lg"
          >
            💰 {t('driver.submitExpense')}
          </Button>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t('driver.recentTrips')}</h2>
          <Button
            variant="outline"
            size="small"
            onClick={() => navigate('/driver/history')}
          >
            {t('driver.viewAll')}
          </Button>
        </div>

        {recentTrips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('driver.noTripsToday')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">
                      {trip.type === 'collection' ? '💧' : '🚚'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {trip.type === 'collection'
                            ? t('driver.collection')
                            : t('driver.delivery')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(trip.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {trip.type === 'collection'
                          ? `${trip.quantity}L from ${trip.supplier || 'N/A'}`
                          : `${trip.quantity}L to ${trip.society || 'N/A'}`}
                      </p>
                      {trip.vehicle && (
                        <p className="text-xs text-gray-500">🚛 {trip.vehicle}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(trip.amount)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        trip.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : trip.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

