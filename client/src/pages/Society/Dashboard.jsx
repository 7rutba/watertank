import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Container from '../../components/Container';
import './Dashboard.css';

const SocietyDashboard = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalConsumption: 0,
    outstandingAmount: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch deliveries
      const deliveriesRes = await api.get('/deliveries/society/my-deliveries');
      const deliveriesData = deliveriesRes.data || [];
      setDeliveries(deliveriesData.slice(0, 5));

      // Fetch invoices
      const invoicesRes = await api.get('/invoices/society/my-invoices');
      const invoicesData = invoicesRes.data || [];
      setInvoices(invoicesData);

      // Calculate stats
      const totalConsumption = deliveriesData.reduce((sum, d) => sum + (d.quantity || 0), 0);
      const outstandingInvoices = invoicesData.filter(i => i.status !== 'paid');
      const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

      setStats({
        totalDeliveries: deliveriesData.length,
        totalConsumption,
        outstandingAmount,
        pendingInvoices: outstandingInvoices.length,
      });
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
      <div className="society-dashboard">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>

        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">💧</div>
              <h3>{t('dashboard.totalDeliveries')}</h3>
              <p className="stat-value">{stats.totalDeliveries}</p>
              <p className="stat-label">{t('delivery.title')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">📊</div>
              <h3>{t('common.consumption') || 'Total Consumption'}</h3>
              <p className="stat-value">{stats.totalConsumption}L</p>
              <p className="stat-label">{t('collection.quantity')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">📄</div>
              <h3>{t('dashboard.outstandingInvoices')}</h3>
              <p className="stat-value">{stats.pendingInvoices}</p>
              <p className="stat-label">{t('invoice.title')}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon">💰</div>
              <h3>{t('report.outstandingAmount')}</h3>
              <p className="stat-value">₹{stats.outstandingAmount.toFixed(2)}</p>
              <p className="stat-label">{t('payment.title')}</p>
            </div>
          </Card>
        </div>

        <div className="sections-grid">
          <Card title={t('delivery.title')} className="section-card">
            <div className="deliveries-list">
              {deliveries.length === 0 ? (
                <p className="no-data">{t('common.noData')}</p>
              ) : (
                deliveries.map((delivery) => (
                  <div key={delivery._id} className="delivery-item">
                    <div className="delivery-info">
                      <p className="delivery-date">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                      <p className="delivery-quantity">{delivery.quantity}L</p>
                    </div>
                    <div className="delivery-amount">
                      ₹{delivery.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="primary" className="view-all-btn">
              {t('common.viewAll') || 'View All Deliveries'}
            </Button>
          </Card>

          <Card title={t('invoice.title')} className="section-card">
            <div className="invoices-list">
              {invoices.length === 0 ? (
                <p className="no-data">{t('common.noData')}</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice._id} className="invoice-item">
                    <div className="invoice-header-item">
                      <span className="invoice-number">{invoice.invoiceNumber}</span>
                      <span className={`status-badge status-${invoice.status}`}>
                        {t(`invoice.${invoice.status}`)}
                      </span>
                    </div>
                    <div className="invoice-details-item">
                      <p>{t('invoice.total')}: ₹{invoice.total?.toFixed(2)}</p>
                      {invoice.dueDate && (
                        <p className="due-date">
                          {t('invoice.dueDate')}: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="invoice-actions-item">
                      <Button variant="primary" size="small">
                        {t('payment.title')}
                      </Button>
                      {invoice.pdfUrl && (
                        <Button variant="secondary" size="small">
                          {t('common.download')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default SocietyDashboard;
