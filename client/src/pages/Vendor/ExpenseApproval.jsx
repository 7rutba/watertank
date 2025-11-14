import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Container from '../../components/Container';
import './ExpenseApproval.css';

const ExpenseApproval = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setExpenses(res.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/expenses/${id}/approve`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(
        status === 'approved'
          ? t('expense.approve') + ' ' + t('common.success')
          : t('expense.reject') + ' ' + t('common.success')
      );
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to update')
      );
      setTimeout(() => setError(''), 3000);
    }
  };

  const getCategoryLabel = (category) => {
    return t(`expense.${category}`) || category;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      paid: 'status-paid',
    };
    return statusClasses[status] || '';
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
      <div className="expense-approval">
        <div className="page-header">
          <h1 className="page-title">{t('expense.title')}</h1>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              {t('expense.pending')} ({expenses.filter(e => e.status === 'pending').length})
            </button>
            <button
              className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              {t('expense.approved')}
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('common.all')}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="expenses-list">
          {expenses.length === 0 ? (
            <Card>
              <p className="no-data">{t('common.noData')}</p>
            </Card>
          ) : (
            expenses.map((expense) => (
              <Card key={expense._id} className="expense-card">
                <div className="expense-header">
                  <div>
                    <h3>{getCategoryLabel(expense.category)}</h3>
                    <span className={`status-badge ${getStatusBadge(expense.status)}`}>
                      {t(`expense.${expense.status}`)}
                    </span>
                  </div>
                  <div className="expense-amount">
                    ₹{expense.amount.toFixed(2)}
                  </div>
                </div>

                <div className="expense-details">
                  <p><strong>{t('expense.driver') || 'Driver'}:</strong> {expense.driverId?.name || 'N/A'}</p>
                  <p><strong>{t('expense.expenseDate')}:</strong> {new Date(expense.expenseDate).toLocaleDateString()}</p>
                  {expense.description && (
                    <p><strong>{t('expense.description')}:</strong> {expense.description}</p>
                  )}
                  {expense.receipt && (
                    <div className="receipt-preview">
                      <img src={`http://localhost:5000/${expense.receipt}`} alt="Receipt" />
                    </div>
                  )}
                  {expense.approvedBy && (
                    <p className="approval-info">
                      <strong>{t('expense.approved')} by:</strong> {expense.approvedBy?.name} on{' '}
                      {new Date(expense.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                  {expense.rejectionReason && (
                    <p className="rejection-info">
                      <strong>{t('expense.reject')} reason:</strong> {expense.rejectionReason}
                    </p>
                  )}
                </div>

                {expense.status === 'pending' && (
                  <div className="expense-actions">
                    <Button
                      variant="success"
                      onClick={() => handleApprove(expense._id, 'approved')}
                    >
                      {t('expense.approve')}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        const reason = prompt(t('expense.rejectReason') || 'Rejection reason:');
                        if (reason) {
                          handleApprove(expense._id, 'rejected');
                        }
                      }}
                    >
                      {t('expense.reject')}
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default ExpenseApproval;

