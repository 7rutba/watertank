import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Container from '../../components/Container';
import './Dashboard.css';

const VendorDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    activeVehicles: 0,
    pendingExpenses: 0,
    outstandingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Fetch dashboard stats
      const dashboardRes = await axios.get('/api/dashboard', config);
      if (dashboardRes.data) {
        setStats({
          todayRevenue: dashboardRes.data.today?.revenue || 0,
          monthlyRevenue: dashboardRes.data.monthly?.revenue || 0,
          monthlyProfit: dashboardRes.data.monthly?.profit || 0,
          activeVehicles: dashboardRes.data.activeVehicles || 0,
          pendingExpenses: dashboardRes.data.pendingExpenses || 0,
          outstandingInvoices: dashboardRes.data.outstanding?.count || 0,
        });
      }

      // Fetch recent deliveries
      const deliveriesRes = await axios.get('/api/deliveries?limit=5', config);
      setRecentActivities(deliveriesRes.data?.slice(0, 5) || []);
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
      <div className="vendor-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t('dashboard.title')}</h1>
          <div className="header-actions">
            <Button variant="primary">{t('invoice.generateMonthly')}</Button>
          </div>
        </div>

        <div className="stats-grid">
          <Card className="stat-card revenue-card">
            <div className="stat-content">
              <div className="stat-icon">💰</div>
              <h3>{t('dashboard.todayRevenue')}</h3>
              <p className="stat-value">₹{stats.todayRevenue.toFixed(2)}</p>
              <p className="stat-label">{t('dashboard.totalDeliveries')}</p>
            </div>
          </Card>

          <Card className="stat-card profit-card">
            <div className="stat-content">
              <div className="stat-icon">📈</div>
              <h3>{t('dashboard.monthlyProfit')}</h3>
              <p className="stat-value">₹{stats.monthlyProfit.toFixed(2)}</p>
              <p className="stat-label">{t('dashboard.monthlyRevenue')}</p>
            </div>
          </Card>

          <Card className="stat-card vehicle-card">
            <div className="stat-content">
              <div className="stat-icon">🚛</div>
              <h3>{t('dashboard.activeVehicles')}</h3>
              <p className="stat-value">{stats.activeVehicles}</p>
              <p className="stat-label">{t('vehicle.title')}</p>
            </div>
          </Card>

          <Card className="stat-card expense-card">
            <div className="stat-content">
              <div className="stat-icon">💸</div>
              <h3>{t('dashboard.pendingExpenses')}</h3>
              <p className="stat-value">{stats.pendingExpenses}</p>
              <p className="stat-label">{t('expense.title')}</p>
            </div>
          </Card>

          <Card className="stat-card invoice-card">
            <div className="stat-content">
              <div className="stat-icon">📄</div>
              <h3>{t('dashboard.outstandingInvoices')}</h3>
              <p className="stat-value">{stats.outstandingInvoices}</p>
              <p className="stat-label">{t('invoice.title')}</p>
            </div>
          </Card>

          <Card className="stat-card revenue-month-card">
            <div className="stat-content">
              <div className="stat-icon">📊</div>
              <h3>{t('dashboard.monthlyRevenue')}</h3>
              <p className="stat-value">₹{stats.monthlyRevenue.toFixed(2)}</p>
              <p className="stat-label">{t('report.monthly')}</p>
            </div>
          </Card>
        </div>

        <div className="quick-actions-section">
          <h2>{t('common.quickActions') || 'Quick Actions'}</h2>
          <div className="quick-actions">
            <Button variant="primary" size="large" className="action-btn">
              {t('supplier.addSupplier')}
            </Button>
            <Button variant="success" size="large" className="action-btn">
              {t('society.addSociety')}
            </Button>
            <Button variant="info" size="large" className="action-btn">
              {t('vehicle.addVehicle')}
            </Button>
            <Button variant="warning" size="large" className="action-btn">
              {t('expense.title')}
            </Button>
            <Button variant="secondary" size="large" className="action-btn">
              {t('report.title')}
            </Button>
          </div>
        </div>

        {recentActivities.length > 0 && (
          <Card title={t('common.recent') || 'Recent Activities'}>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-type">{t('delivery.title')}</p>
                    <p className="activity-details">
                      {activity.societyId?.name || 'N/A'} - {activity.quantity}L
                    </p>
                    <p className="activity-time">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="activity-amount">
                    ₹{activity.totalAmount?.toFixed(2) || '0.00'}
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

export default VendorDashboard;

