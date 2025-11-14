import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './SubmitExpense.css';

const SubmitExpense = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { value: 'fuel', label: t('expense.fuel') },
    { value: 'toll', label: t('expense.toll') },
    { value: 'maintenance', label: t('expense.maintenance') },
    { value: 'food', label: t('expense.food') },
    { value: 'medical', label: t('expense.medical') },
    { value: 'personal', label: t('expense.personal') },
    { value: 'other', label: t('expense.other') },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('common.fileTooLarge') || 'File size should be less than 5MB');
        return;
      }
      setReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.category || !formData.amount) {
      setError(t('common.fillAllFields') || 'Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('category', formData.category);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('expenseDate', formData.expenseDate);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }

      await axios.post('/api/expenses', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(t('expense.addExpense') + ' ' + t('common.success'));
      // Reset form
      setFormData({
        category: '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      setReceipt(null);
      setReceiptPreview(null);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('common.error') + ': ' + (error.message || 'Failed to submit')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="submit-expense">
        <h1 className="page-title">{t('expense.addExpense')}</h1>

        <Card>
          <form onSubmit={handleSubmit} className="expense-form">
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

            <div className="form-row">
              <div className="form-group">
                <label>{t('expense.category')} *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">{t('common.select') || 'Select Category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <Input
                  type="number"
                  name="amount"
                  label={t('expense.amount') + ' *'}
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-group">
              <Input
                type="date"
                name="expenseDate"
                label={t('expense.expenseDate')}
                value={formData.expenseDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('expense.description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea-field"
                placeholder={t('expense.description')}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>{t('expense.receipt')} ({t('common.optional') || 'Optional'})</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptChange}
                className="file-input"
                capture="environment"
              />
              {receiptPreview && (
                <div className="receipt-preview">
                  <img src={receiptPreview} alt="Receipt Preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={submitting}
                className="submit-btn"
              >
                {submitting ? t('common.loading') : t('common.submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
};

export default SubmitExpense;

