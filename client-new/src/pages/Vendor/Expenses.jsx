import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Expenses = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filters, setFilters] = useState({
    status: 'pending',
    driverId: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.driverId) params.append('driverId', filters.driverId);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      status: 'pending',
      driverId: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleApprove = async (expenseId, status) => {
    try {
      setApproving(true);
      await api.put(`/expenses/${expenseId}/approve`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      });
      setShowApproveModal(false);
      setSelectedExpense(null);
      setRejectionReason('');
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setApproving(false);
    }
  };

  const openDetailsModal = async (expense) => {
    try {
      const response = await api.get(`/expenses/${expense._id}`);
      setSelectedExpense(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching expense details:', error);
    }
  };

  const openApproveModal = (expense) => {
    setSelectedExpense(expense);
    setShowApproveModal(true);
    setRejectionReason('');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      fuel: t('vendor.fuel'),
      toll: t('vendor.toll'),
      maintenance: t('vendor.maintenance'),
      food: t('vendor.food'),
      medical: t('vendor.medical'),
      personal: t('vendor.personal'),
      other: t('vendor.other'),
    };
    return labels[category] || category;
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.expenses')}</h1>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const totalPending = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.expenses')}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Review and approve driver expenses</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.pendingExpenses')}</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{pendingExpenses.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalPendingAmount')}</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(totalPending)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalExpenses')}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{expenses.length}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.driver')}</label>
            <select
              name="driverId"
              value={filters.driverId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>{driver.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.category')}</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Categories</option>
              <option value="fuel">{t('vendor.fuel')}</option>
              <option value="toll">{t('vendor.toll')}</option>
              <option value="maintenance">{t('vendor.maintenance')}</option>
              <option value="food">{t('vendor.food')}</option>
              <option value="medical">{t('vendor.medical')}</option>
              <option value="personal">{t('vendor.personal')}</option>
              <option value="other">{t('vendor.other')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')}</label>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')}</label>
            <div className="flex gap-2">
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mb-0 flex-1"
              />
              <Button variant="outline" size="small" onClick={clearFilters} className="whitespace-nowrap">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.driver')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.category')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.description')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.amount')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {t('vendor.noExpenses')}
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {expense.driverId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryLabel(expense.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(expense.amount || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                        expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => openDetailsModal(expense)}
                        >
                          {t('vendor.viewDetails')}
                        </Button>
                        {expense.status === 'pending' && (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => openApproveModal(expense)}
                          >
                            {t('vendor.review')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expense Details Modal */}
      {showDetailsModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('vendor.expenseDetails')}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedExpense(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('vendor.date')}:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedExpense.expenseDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('common.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedExpense.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedExpense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedExpense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedExpense.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.driver')}:</span>
                  <span className="ml-2 font-medium">{selectedExpense.driverId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.category')}:</span>
                  <span className="ml-2 font-medium">{getCategoryLabel(selectedExpense.category)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.amount')}:</span>
                  <span className="ml-2 font-medium text-lg text-primary">{formatCurrency(selectedExpense.amount || 0)}</span>
                </div>
                {selectedExpense.approvedBy && (
                  <div>
                    <span className="text-gray-600">Approved By:</span>
                    <span className="ml-2 font-medium">{selectedExpense.approvedBy?.name || 'N/A'}</span>
                  </div>
                )}
              </div>
              
              {selectedExpense.description && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.description')}:</span>
                  <div className="mt-1 text-sm text-gray-800">{selectedExpense.description}</div>
                </div>
              )}
              
              {selectedExpense.rejectionReason && (
                <div>
                  <span className="text-gray-600 text-sm">Rejection Reason:</span>
                  <div className="mt-1 text-sm text-red-800">{selectedExpense.rejectionReason}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedExpense(null); }}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showApproveModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('vendor.reviewExpense')}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('vendor.driver')}:</span>
                  <span className="ml-2 font-medium">{selectedExpense.driverId?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.category')}:</span>
                  <span className="ml-2 font-medium">{getCategoryLabel(selectedExpense.category)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.amount')}:</span>
                  <span className="ml-2 font-medium text-lg text-primary">{formatCurrency(selectedExpense.amount || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('vendor.date')}:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedExpense.expenseDate)}</span>
                </div>
              </div>
              
              {selectedExpense.description && (
                <div>
                  <span className="text-gray-600 text-sm">{t('vendor.description')}:</span>
                  <div className="mt-1 text-sm text-gray-800">{selectedExpense.description}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleApprove(selectedExpense._id, 'approved')}
                disabled={approving}
                className="flex-1"
              >
                {t('vendor.approve')}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleApprove(selectedExpense._id, 'rejected')}
                disabled={approving || !rejectionReason}
                className="flex-1"
              >
                {t('vendor.reject')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowApproveModal(false); setSelectedExpense(null); setRejectionReason(''); }}
                disabled={approving}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

