import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vendorId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      // This would typically be an onboarding endpoint
      // For now, we'll use login to verify credentials
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data) {
        // Store token
        localStorage.setItem('token', response.data.token);
        // Redirect to vendor dashboard
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError(error.response?.data?.message || 'Invalid credentials. Please contact your administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome to Water Tank Management
          </h1>
          <p className="text-lg text-gray-600">
            Vendor Onboarding Portal
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">Enter Credentials</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">Complete Setup</span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Step 1: Enter Your Credentials</h2>
              <p className="text-sm text-gray-600 mb-6">
                Please enter the credentials provided by your administrator to begin the onboarding process.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (formData.vendorId && formData.email) {
                  setStep(2);
                } else {
                  setError('Please fill in all required fields');
                }
              }} className="space-y-4">
                <Input
                  label="Vendor ID"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  placeholder="Enter your Vendor ID (e.g., VENDOR-0001)"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Continue
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Don't have credentials?</strong> Please contact your administrator or super admin to get your vendor account credentials.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Step 2: Set Your Password</h2>
              <p className="text-sm text-gray-600 mb-6">
                Please set a secure password for your account. Make sure to use a strong password that you can remember.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded border mb-4">
                  <p className="text-xs text-gray-600 mb-1">Vendor ID:</p>
                  <p className="text-sm font-mono text-gray-800">{formData.vendorId}</p>
                  <p className="text-xs text-gray-600 mb-1 mt-2">Email:</p>
                  <p className="text-sm font-mono text-gray-800">{formData.email}</p>
                </div>

                <Input
                  label="New Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your new password (minimum 6 characters)"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                      At least 6 characters {formData.password.length >= 6 ? '✓' : ''}
                    </li>
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      Recommended: 8+ characters for better security {formData.password.length >= 8 ? '✓' : ''}
                    </li>
                    <li className={formData.password === formData.confirmPassword && formData.password ? 'text-green-600' : ''}>
                      Passwords match {formData.password === formData.confirmPassword && formData.password ? '✓' : ''}
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                    disabled={loading || formData.password.length < 6 || formData.password !== formData.confirmPassword}
                  >
                    {loading ? 'Setting up...' : 'Complete Onboarding'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

