import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Reports = () => {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState('profitLoss');
  const [loading, setLoading] = useState(false);
  const [profitLossData, setProfitLossData] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: '',
  });

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/reports/profit-loss?${params.toString()}`);
      setProfitLossData(response.data);
    } catch (error) {
      console.error('Error fetching profit & loss report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstanding = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      
      const response = await api.get(`/reports/outstanding?${params.toString()}`);
      setOutstandingData(response.data);
    } catch (error) {
      console.error('Error fetching outstanding report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('month', filters.month);
      params.append('year', filters.year);
      
      const response = await api.get(`/reports/monthly?${params.toString()}`);
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (activeReport === 'profitLoss') {
      fetchProfitLoss();
    } else if (activeReport === 'outstanding') {
      fetchOutstanding();
    } else if (activeReport === 'monthly') {
      fetchMonthly();
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.reports')}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Generate financial and operational reports</p>
      </div>

      {/* Report Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'profitLoss', label: t('vendor.profitLoss') },
              { id: 'outstanding', label: t('vendor.outstandingReport') },
              { id: 'monthly', label: t('vendor.monthlyReport') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeReport === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeReport === 'profitLoss' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')}</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')}</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </>
          )}
          
          {activeReport === 'outstanding' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="">All</option>
                <option value="supplier">Supplier</option>
                <option value="society">Society</option>
              </select>
            </div>
          )}
          
          {activeReport === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Input
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                  min="2020"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </>
          )}
          
          <div className="flex items-end">
            <Button onClick={handleGenerateReport} variant="primary" disabled={loading} className="w-full">
              {loading ? t('common.loading') : t('vendor.generateReport')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Profit & Loss Report */}
      {activeReport === 'profitLoss' && profitLossData && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.profitLoss')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">{t('vendor.revenue')}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-medium">{formatCurrency(profitLossData.revenue.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deliveries:</span>
                    <span>{profitLossData.revenue.deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Delivery:</span>
                    <span>{formatCurrency(profitLossData.revenue.averagePerDelivery)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">{t('vendor.costs')}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Purchase Cost:</span>
                    <span className="font-medium">{formatCurrency(profitLossData.costs.purchase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-medium">{formatCurrency(profitLossData.costs.expenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Costs:</span>
                    <span className="font-medium text-red-600">{formatCurrency(profitLossData.costs.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <h3 className="font-semibold text-gray-700 mb-2">{t('vendor.profit')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">{t('vendor.grossProfit')}</div>
                    <div className="text-xl font-bold text-primary">{formatCurrency(profitLossData.profit.gross)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('vendor.netProfit')}</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(profitLossData.profit.net)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('vendor.margin')}</div>
                    <div className="text-xl font-bold text-blue-600">{profitLossData.profit.margin}%</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Outstanding Report */}
      {activeReport === 'outstanding' && outstandingData && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.outstandingReport')}</h2>
          <div className="mb-4 p-3 bg-red-50 rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Outstanding:</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(outstandingData.totalOutstanding)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{outstandingData.count} invoices</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">{t('vendor.invoiceNumber')}</th>
                  <th className="px-3 py-2 text-left">{t('vendor.relatedTo')}</th>
                  <th className="px-3 py-2 text-right">{t('vendor.total')}</th>
                  <th className="px-3 py-2 text-right">{t('vendor.paid')}</th>
                  <th className="px-3 py-2 text-right">{t('vendor.outstanding')}</th>
                  <th className="px-3 py-2 text-left">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {outstandingData.invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="border-b">
                    <td className="px-3 py-2">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2 capitalize">{inv.relatedTo}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(inv.total)}</td>
                    <td className="px-3 py-2 text-right text-green-600">{formatCurrency(inv.paid)}</td>
                    <td className="px-3 py-2 text-right text-red-600 font-medium">{formatCurrency(inv.outstanding)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Monthly Report */}
      {activeReport === 'monthly' && monthlyData && (
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('vendor.monthlyReport')}</h2>
          <div className="mb-4 text-sm text-gray-600">
            Period: {formatDate(monthlyData.period.startDate)} to {formatDate(monthlyData.period.endDate)}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Operations</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Deliveries:</span>
                  <span>{monthlyData.deliveries.total} ({monthlyData.deliveries.completed} completed)</span>
                </div>
                <div className="flex justify-between">
                  <span>Collections:</span>
                  <span>{monthlyData.collections.total} ({monthlyData.collections.completed} completed)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t('vendor.financials')}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('vendor.revenue')}:</span>
                  <span className="font-medium text-green-600">{formatCurrency(monthlyData.financial.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vendor.purchase')}:</span>
                  <span className="font-medium">{formatCurrency(monthlyData.financial.purchase)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vendor.expenses')}:</span>
                  <span className="font-medium">{formatCurrency(monthlyData.financial.expenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vendor.payments')}:</span>
                  <span className="font-medium">{formatCurrency(monthlyData.financial.payments)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-semibold">{t('vendor.profit')}:</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(monthlyData.financial.profit)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;

