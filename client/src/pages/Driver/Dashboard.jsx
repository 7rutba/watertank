import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Container from '../../components/Container';
import './Dashboard.css';

const DriverDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayCollections: 0,
    todayDeliveries: 0,
    todayRevenue: 0,
    pendingExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Fetch today's collections
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const collectionsRes = await axios.get(
        `/api/collections?startDate=${today.toISOString()}`,
        config
      );

      // Fetch today's deliveries
      const deliveriesRes = await axios.get(
        `/api/deliveries?startDate=${today.toISOString()}`,
        config
      );

      // Fetch pending expenses
      const expensesRes = await axios.get(
        `/api/expenses?status=pending`,
        config
      );

      const collections = collectionsRes.data || [];
      const deliveries = deliveriesRes.data || [];
      const expenses = expensesRes.data || [];

      setStats({
        todayCollections: collections.length,
        todayDeliveries: deliveries.length,
        todayRevenue: deliveries.reduce((sum, d) => sum + (d.totalAmount || 0), 0),
        pendingExpenses: expenses.length,
      });

      // Get recent trips (combine collections and deliveries)
      const recent = [...collections, ...deliveries]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTrips(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="loading-container">
          <p>{t('common.loading')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="driver-dashboard">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>

        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <h3>{t('collection.title')}</h3>
              <p className="stat-value">{stats.todayCollections}</p>
              <p className="stat-label">{t('dashboard.totalCollections')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <h3>{t('delivery.title')}</h3>
              <p className="stat-value">{stats.todayDeliveries}</p>
              <p className="stat-label">{t('dashboard.totalDeliveries')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <h3>{t('dashboard.todayRevenue')}</h3>
              <p className="stat-value">₹{stats.todayRevenue.toFixed(2)}</p>
              <p className="stat-label">{t('common.success')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <h3>{t('expense.title')}</h3>
              <p className="stat-value">{stats.pendingExpenses}</p>
              <p className="stat-label">{t('dashboard.pendingExpenses')}</p>
            </div>
          </Card>
        </div>

        <div className="quick-actions">
          <h2>{t('common.add')}</h2>
          <div className="action-buttons">
            <Button variant="primary" size="large" className="action-btn">
              {t('collection.addCollection')}
            </Button>
            <Button variant="success" size="large" className="action-btn">
              {t('delivery.addDelivery')}
            </Button>
            <Button variant="info" size="large" className="action-btn">
              {t('expense.addExpense')}
            </Button>
          </div>
        </div>

        {recentTrips.length > 0 && (
          <Card title={t('common.recent') || 'Recent Activity'}>
            <div className="recent-trips">
              {recentTrips.map((trip) => (
                <div key={trip._id} className="trip-item">
                  <div className="trip-info">
                    <p className="trip-type">
                      {trip.supplierId ? t('collection.title') : t('delivery.title')}
                    </p>
                    <p className="trip-details">
                      {trip.quantity}L - ₹{trip.totalAmount || trip.purchaseAmount || trip.deliveryAmount}
                    </p>
                    <p className="trip-time">
                      {new Date(trip.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`trip-status trip-status-${trip.status}`}>
                    {t(`${trip.supplierId ? 'collection' : 'delivery'}.${trip.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default DriverDashboard;

