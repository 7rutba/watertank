import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Container from '../../components/Container';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
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
      } else if (role === 'society_admin') {
        navigate('/society/dashboard');
      } else if (role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t('auth.loginError') ||
          'Invalid email or password'
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
              <h1>{t('auth.login')}</h1>
              <p>{t('common.welcome')} to Watertank</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

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
                type="password"
                name="password"
                label={t('auth.password')}
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password')}
                required
                autoComplete="current-password"
              />

              <div className="auth-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <a href="#" className="forgot-link">
                  {t('auth.forgotPassword')}
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? t('common.loading') : t('auth.login')}
              </Button>

              <div className="auth-footer">
                <p>
                  {t('auth.dontHaveAccount')}{' '}
                  <a href="/register" className="auth-link">
                    {t('auth.register')}
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

export default Login;

