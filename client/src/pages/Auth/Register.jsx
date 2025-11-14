import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'driver',
    vendorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await api.post('/auth/register', dataToSend);
      const { token, role } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Redirect based on role
      if (role === 'driver') {
        navigate('/driver/dashboard');
      } else if (role === 'vendor' || role === 'accountant') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('auth.registerError') ||
          'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card">
            <div className="auth-header">
              <h1>{t('auth.register')}</h1>
              <p>{t('common.welcome')} to Watertank</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <Input
                type="text"
                name="name"
                label={t('auth.name')}
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.name')}
                required
              />

              <Input
                type="email"
                name="email"
                label={t('auth.email')}
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.email')}
                required
                autoComplete="email"
              />

              <Input
                type="tel"
                name="phone"
                label={t('auth.phone')}
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('auth.phone')}
              />

              <div className="form-group">
                <label>{t('auth.role')}</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="driver">{t('common.driver') || 'Driver'}</option>
                  <option value="vendor">{t('common.vendor') || 'Vendor'}</option>
                  <option value="accountant">{t('common.accountant') || 'Accountant'}</option>
                </select>
              </div>

              {(formData.role === 'driver' || formData.role === 'vendor' || formData.role === 'accountant') && (
                <Input
                  type="text"
                  name="vendorId"
                  label={t('common.vendorId') || 'Vendor ID'}
                  value={formData.vendorId}
                  onChange={handleChange}
                  placeholder={t('common.vendorId') || 'Vendor ID'}
                  required
                />
              )}

              <Input
                type="password"
                name="password"
                label={t('auth.password')}
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                required
                autoComplete="new-password"
                minLength="6"
              />

              <Input
                type="password"
                name="confirmPassword"
                label={t('auth.confirmPassword') || 'Confirm Password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPassword') || 'Confirm Password'}
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? t('common.loading') : t('auth.register')}
              </Button>

              <div className="auth-footer">
                <p>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <a href="/login" className="auth-link">
                    {t('auth.login')}
                  </a>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Register;

