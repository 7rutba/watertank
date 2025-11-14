import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

const SubmitExpense = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const categories = [
    { value: 'fuel', label: t('driver.fuel') },
    { value: 'toll', label: t('driver.toll') },
    { value: 'maintenance', label: t('driver.maintenance') },
    { value: 'food', label: t('driver.food') },
    { value: 'medical', label: t('driver.medical') },
    { value: 'personal', label: t('driver.personal') },
    { value: 'other', label: t('driver.other') },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          receiptPhoto: 'Photo size must be less than 5MB',
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          receiptPhoto: 'Please select an image file',
        }));
        return;
      }
      setReceiptPhoto(file);
      setErrors(prev => ({
        ...prev,
        receiptPhoto: '',
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setReceiptPhoto(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById('receiptPhoto');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    } else {
      const selectedDate = new Date(formData.expenseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.expenseDate = 'Expense date cannot be in the future';
      }
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!receiptPhoto) {
      // Warning but not blocking
      newErrors.receiptPhoto = 'Receipt photo is recommended';
    }
    setErrors(newErrors);
    // Allow submission even without receipt (just show warning)
    return Object.keys(newErrors).filter(key => key !== 'receiptPhoto').length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    // Warn if no receipt
    if (!receiptPhoto) {
      const proceed = window.confirm('No receipt photo provided. Continue anyway?');
      if (!proceed) {
        return;
      }
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('amount', formData.amount);
      submitData.append('expenseDate', formData.expenseDate);
      submitData.append('description', formData.description);
      if (receiptPhoto) {
        submitData.append('receipt', receiptPhoto);
      }

      await api.post('/expenses', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(t('driver.expenseSubmitted'));
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error submitting expense:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit expense. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('driver.submitExpense')}</h1>
        <p className="text-gray-600 mt-1">{t('driver.expenseDescription')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.category')} *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">{t('driver.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <Input
            label={`${t('driver.amount')} (₹) *`}
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            error={errors.amount}
          />
        </div>

        {/* Expense Date */}
        <div>
          <Input
            label={`${t('driver.expenseDate')} *`}
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
            error={errors.expenseDate}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.description')} * (Min 10 characters)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('driver.descriptionPlaceholder')}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/10 characters minimum
          </p>
        </div>

        {/* Receipt Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('driver.receiptPhoto')} ({t('common.recommended')})
          </label>
          {photoPreview ? (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Receipt preview"
                  className="w-full h-64 object-contain border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receiptPhoto').click()}
                className="w-full"
              >
                {t('driver.changePhoto')}
              </Button>
            </div>
          ) : (
            <div>
              <input
                id="receiptPhoto"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receiptPhoto').click()}
                className="w-full"
              >
                📷 {t('driver.takePhoto')}
              </Button>
            </div>
          )}
          {errors.receiptPhoto && (
            <p className={`mt-1 text-sm ${receiptPhoto ? 'text-red-600' : 'text-yellow-600'}`}>
              {errors.receiptPhoto}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {t('driver.receiptHint')}
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('driver.submitting')}
              </span>
            ) : (
              t('driver.submit')
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/driver/dashboard')}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitExpense;

