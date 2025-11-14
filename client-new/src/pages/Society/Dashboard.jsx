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
    totalDeliveries: 0,
    monthlyConsumption: 0,
    outstandingInvoices: 0,
    totalPaid: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch deliveries (automatically filtered by societyId from middleware)
      const deliveriesResponse = await api.get('/deliveries/society/my-deliveries');
      const allDeliveries = deliveriesResponse.data || [];
      setRecentDeliveries(allDeliveries.slice(0, 5));

      // Calculate monthly consumption
      const today = new Date();
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyDeliveries = allDeliveries.filter(
        d => new Date(d.createdAt) >= currentMonthStart
      );
      const monthlyConsumption = monthlyDeliveries.reduce(
        (sum, d) => sum + (d.quantity || 0),
        0
      );

      // Fetch invoices (automatically filtered by societyId from middleware)
      const invoicesResponse = await api.get('/invoices/society/my-invoices');
      const allInvoices = invoicesResponse.data || [];
      setRecentInvoices(allInvoices.slice(0, 5));

      // Calculate outstanding invoices
      const outstandingInvoices = allInvoices.filter(
        inv => inv.status === 'sent' || inv.status === 'overdue'
      );
      const outstandingAmount = outstandingInvoices.reduce(
        (sum, inv) => sum + (inv.total || 0),
        0
      );

      // Calculate total paid
      const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
      const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

      setStats({
        totalDeliveries: allDeliveries.length,
        monthlyConsumption,
        outstandingInvoices: outstandingAmount,
        totalPaid,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('society.dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('society.welcomeMessage')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('society.totalDeliveries')}</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalDeliveries}</p>
            </div>
            <span className="text-3xl">🚚</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('society.monthlyConsumption')}</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.monthlyConsumption}L</p>
            </div>
            <span className="text-3xl">💧</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">{t('society.outstandingInvoices')}</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{formatCurrency(stats.outstandingInvoices)}</p>
            </div>
            <span className="text-3xl">📄</span>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('society.totalPaid')}</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <span className="text-3xl">💳</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('society.quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => navigate('/society/deliveries')}
            className="w-full py-3 text-lg"
          >
            🚚 {t('society.viewAllDeliveries')}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/society/invoices')}
            className="w-full py-3 text-lg"
          >
            📄 {t('society.viewAllInvoices')}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/society/payments')}
            className="w-full py-3 text-lg"
          >
            💳 {t('society.makePayment')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('society.recentDeliveries')}</h2>
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate('/society/deliveries')}
            >
              {t('society.viewAll')}
            </Button>
          </div>

          {recentDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('society.noDeliveries')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <div
                  key={delivery._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {formatDate(delivery.createdAt)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(delivery.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {delivery.quantity}L delivered
                      </p>
                      {delivery.vehicleId?.vehicleNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          🚛 {delivery.vehicleId.vehicleNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatCurrency(delivery.totalAmount)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                          delivery.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('society.recentInvoices')}</h2>
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate('/society/invoices')}
            >
              {t('society.viewAll')}
            </Button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('society.noInvoices')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(invoice.createdAt)}
                        </span>
                      </div>
                      {invoice.period && (
                        <p className="text-xs text-gray-600 mb-1">
                          {formatDate(invoice.period.startDate)} - {formatDate(invoice.period.endDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatCurrency(invoice.total)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

