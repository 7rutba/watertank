import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import api from '../../utils/api';

const Financials = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const [plResponse, outResponse, monResponse] = await Promise.all([
        api.get(`/reports/profit-loss?startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`),
        api.get('/reports/outstanding'),
        api.get(`/reports/monthly?month=${today.getMonth() + 1}&year=${today.getFullYear()}`),
      ]);
      
      setProfitLoss(plResponse.data);
      setOutstanding(outResponse.data);
      setMonthly(monResponse.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.financials')}</h1>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.financials')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t('vendor.financialOverview')}</p>
        </div>
        <button
          onClick={fetchFinancialData}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalRevenue')}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {profitLoss ? formatCurrency(profitLoss.revenue.total) : '-'}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalCosts')}</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {profitLoss ? formatCurrency(profitLoss.costs.total) : '-'}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalProfit')}</div>
          <div className="text-2xl font-bold text-primary mt-1">
            {profitLoss ? formatCurrency(profitLoss.profit.net) : '-'}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.outstanding')}</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {outstanding ? formatCurrency(outstanding.totalOutstanding) : '-'}
          </div>
        </Card>
      </div>

      {/* Profit & Loss Overview */}
      {profitLoss && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.profitLoss')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">{t('vendor.revenue')}</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(profitLoss.revenue.total)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {profitLoss.revenue.deliveries} deliveries
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600">{t('vendor.costs')}</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(profitLoss.costs.total)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Purchase: {formatCurrency(profitLoss.costs.purchase)}<br />
                Expenses: {formatCurrency(profitLoss.costs.expenses)}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">{t('vendor.netProfit')}</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(profitLoss.profit.net)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Margin: {profitLoss.profit.margin}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Outstanding Summary */}
      {outstanding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.receivables')}</h2>
            <div className="space-y-2">
              {outstanding.invoices
                .filter(inv => inv.relatedTo === 'society')
                .slice(0, 5)
                .map((inv) => (
                  <div key={inv.invoiceId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{inv.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(inv.outstanding)} outstanding</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              {outstanding.invoices.filter(inv => inv.relatedTo === 'society').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No receivables</p>
              )}
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.payables')}</h2>
            <div className="space-y-2">
              {outstanding.invoices
                .filter(inv => inv.relatedTo === 'supplier')
                .slice(0, 5)
                .map((inv) => (
                  <div key={inv.invoiceId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">{inv.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(inv.outstanding)} outstanding</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              {outstanding.invoices.filter(inv => inv.relatedTo === 'supplier').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No payables</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Summary */}
      {monthly && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Current Month Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Deliveries</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{monthly.deliveries.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Collections</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{monthly.collections.total}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">{t('vendor.revenue')}</div>
              <div className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(monthly.financial.revenue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">{t('vendor.profit')}</div>
              <div className="text-xl font-bold text-primary mt-1">
                {formatCurrency(monthly.financial.profit)}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Financials;

