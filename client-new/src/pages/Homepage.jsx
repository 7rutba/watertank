import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const Homepage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // If logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (token && userRole) {
      switch (userRole) {
        case 'super_admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'vendor':
        case 'accountant':
          navigate('/vendor/dashboard', { replace: true });
          break;
        case 'driver':
          navigate('/driver/dashboard', { replace: true });
          break;
        case 'society_admin':
          navigate('/society/dashboard', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    }
  }, [token, userRole, navigate]);

  // Show homepage if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Water Tank Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Efficient water delivery and collection management
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">For Administrators</h2>
              <p className="text-gray-600 mb-4">
                Manage vendors, subscriptions, and system settings
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Admin Login
                </Button>
              </Link>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">For Vendors</h2>
              <p className="text-gray-600 mb-4">
                Manage your water delivery business operations
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Vendor Login
                </Button>
              </Link>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-600 mb-4">New vendor? Get started with onboarding</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/vendor/onboarding">
                <Button variant="outline">
                  Vendor Onboarding
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Homepage;

