import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './Reports.css';

const Reports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profitLoss');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [profitLossData, setProfitLossData] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('all');

  useEffect(() => {
    if (activeTab === 'profitLoss') {
      fetchProfitLoss();
    } else if (activeTab === 'outstanding') {
      fetchOutstanding();
    } else if (activeTab === 'monthly') {
      fetchMonthly();
    }
  }, [activeTab, dateRange, month, year, type]);

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const res = await api.get('/reports/profit-loss', { params });
      setProfitLossData(res.data);
    } catch (error) {
      console.error('Error fetching profit & loss:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstanding = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type !== 'all') params.type = type;

      const res = await api.get('/reports/outstanding', { params });
      setOutstandingData(res.data);
    } catch (error) {
      console.error('Error fetching outstanding:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const params = { month, year };

      const res = await api.get('/reports/monthly', { params });
      setMonthlyData(res.data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container>
      <div className="reports-page">
        <h1 className="page-title">{t('report.title')}</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'profitLoss' ? 'active' : ''}`}
            onClick={() => setActiveTab('profitLoss')}
          >
            {t('report.profitLoss')}
          </button>
          <button
            className={`tab ${activeTab === 'outstanding' ? 'active' : ''}`}
            onClick={() => setActiveTab('outstanding')}
          >
            {t('report.outstanding')}
          </button>
          <button
            className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            {t('report.monthly')}
          </button>
        </div>

        {activeTab === 'profitLoss' && (
          <Card className="report-card">
            <div className="report-header">
              <h2>{t('report.profitLoss')}</h2>
              <div className="date-filters">
                <Input
                  type="date"
                  name="startDate"
                  label={t('common.startDate')}
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
                <Input
                  type="date"
                  name="endDate"
                  label={t('common.endDate')}
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            {loading ? (
              <p>{t('common.loading')}</p>
            ) : profitLossData ? (
              <div className="profit-loss-report">
                <div className="report-section">
                  <h3>{t('report.revenue')}</h3>
                  <div className="metric-row">
                    <span>{t('report.revenue')}:</span>
                    <strong>₹{profitLossData.revenue?.total?.toFixed(2) || '0.00'}</strong>
                  </div>
                  <div className="metric-row">
                    <span>{t('dashboard.totalDeliveries')}:</span>
                    <strong>{profitLossData.revenue?.trips || 0}</strong>
                  </div>
                </div>

                <div className="report-section">
                  <h3>{t('report.costs')}</h3>
                  <div className="metric-row">
                    <span>{t('report.purchase') || 'Purchase'}:</span>
                    <strong>₹{profitLossData.costs?.purchase?.toFixed(2) || '0.00'}</strong>
                  </div>
                  <div className="metric-row">
                    <span>{t('expense.title')}:</span>
                    <strong>₹{profitLossData.costs?.expenses?.toFixed(2) || '0.00'}</strong>
                  </div>
                  <div className="metric-row total">
                    <span>{t('report.costs')}:</span>
                    <strong>₹{profitLossData.costs?.total?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>

                <div className="report-section highlight">
                  <h3>{t('report.profit')}</h3>
                  <div className="metric-row">
                    <span>{t('report.grossProfit')}:</span>
                    <strong className="positive">₹{profitLossData.profit?.gross?.toFixed(2) || '0.00'}</strong>
                  </div>
                  <div className="metric-row">
                    <span>{t('report.netProfit')}:</span>
                    <strong className={profitLossData.profit?.net >= 0 ? 'positive' : 'negative'}>
                      ₹{profitLossData.profit?.net?.toFixed(2) || '0.00'}
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span>{t('report.margin')}:</span>
                    <strong>{profitLossData.profit?.margin || '0'}%</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        )}

        {activeTab === 'outstanding' && (
          <Card className="report-card">
            <div className="report-header">
              <h2>{t('report.outstanding')}</h2>
              <div className="filter-group">
                <label>{t('common.filter')}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="supplier">{t('supplier.title')}</option>
                  <option value="society">{t('society.title')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p>{t('common.loading')}</p>
            ) : outstandingData ? (
              <div className="outstanding-report">
                <div className="summary-card">
                  <h3>{t('report.outstandingAmount')}</h3>
                  <p className="total-amount">₹{outstandingData.totalOutstanding?.toFixed(2) || '0.00'}</p>
                  <p className="count">{outstandingData.count || 0} {t('invoice.title')}</p>
                </div>

                <div className="outstanding-list">
                  {outstandingData.invoices?.map((invoice) => (
                    <div key={invoice.invoiceId} className="outstanding-item">
                      <div className="item-header">
                        <span className="invoice-number">{invoice.invoiceNumber}</span>
                        <span className={`status-badge status-${invoice.status}`}>
                          {t(`invoice.${invoice.status}`)}
                        </span>
                      </div>
                      <div className="item-details">
                        <p><strong>{invoice.relatedTo === 'supplier' ? t('supplier.title') : t('society.title')}:</strong> {invoice.relatedId?.name || 'N/A'}</p>
                        <div className="amount-breakdown">
                          <span>{t('invoice.total')}: ₹{invoice.total?.toFixed(2)}</span>
                          <span>{t('common.paid') || 'Paid'}: ₹{invoice.paid?.toFixed(2)}</span>
                          <span className="outstanding-amount">{t('report.outstanding')}: ₹{invoice.outstanding?.toFixed(2)}</span>
                        </div>
                        {invoice.dueDate && (
                          <p className="due-date">{t('invoice.dueDate')}: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        )}

        {activeTab === 'monthly' && (
          <Card className="report-card">
            <div className="report-header">
              <h2>{t('report.monthly')}</h2>
              <div className="month-year-filters">
                <div className="filter-group">
                  <label>{t('common.month') || 'Month'}</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>{t('common.year') || 'Year'}</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <p>{t('common.loading')}</p>
            ) : monthlyData ? (
              <div className="monthly-report">
                <div className="report-grid">
                  <div className="metric-card">
                    <h4>{t('dashboard.totalDeliveries')}</h4>
                    <p className="metric-value">{monthlyData.deliveries?.total || 0}</p>
                    <p className="metric-label">{t('delivery.title')}</p>
                  </div>

                  <div className="metric-card">
                    <h4>{t('dashboard.totalCollections')}</h4>
                    <p className="metric-value">{monthlyData.collections?.total || 0}</p>
                    <p className="metric-label">{t('collection.title')}</p>
                  </div>

                  <div className="metric-card highlight">
                    <h4>{t('report.revenue')}</h4>
                    <p className="metric-value positive">₹{monthlyData.financial?.revenue?.toFixed(2) || '0.00'}</p>
                    <p className="metric-label">{t('report.revenue')}</p>
                  </div>

                  <div className="metric-card">
                    <h4>{t('report.purchase') || 'Purchase'}</h4>
                    <p className="metric-value">₹{monthlyData.financial?.purchase?.toFixed(2) || '0.00'}</p>
                    <p className="metric-label">{t('supplier.title')}</p>
                  </div>

                  <div className="metric-card">
                    <h4>{t('expense.title')}</h4>
                    <p className="metric-value">₹{monthlyData.financial?.expenses?.toFixed(2) || '0.00'}</p>
                    <p className="metric-label">{t('expense.title')}</p>
                  </div>

                  <div className="metric-card highlight">
                    <h4>{t('report.profit')}</h4>
                    <p className={`metric-value ${monthlyData.financial?.profit >= 0 ? 'positive' : 'negative'}`}>
                      ₹{monthlyData.financial?.profit?.toFixed(2) || '0.00'}
                    </p>
                    <p className="metric-label">{t('report.netProfit')}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        )}
      </div>
    </Container>
  );
};

export default Reports;

