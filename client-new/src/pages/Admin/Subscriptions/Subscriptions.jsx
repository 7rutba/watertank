import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import api from '../../../utils/api';

const Subscriptions = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'subscriptions'
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    features: [],
    limits: {
      vendors: '',
      users: '',
      vehicles: '',
      storage: '',
    },
    isActive: true,
    isDefault: false,
  });
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    vendorId: '',
    planId: '',
    startDate: '',
    billingCycle: 'monthly',
    autoRenew: true,
  });
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'plans') {
        const response = await api.get('/admin/subscriptions/plans');
        setPlans(response.data);
      } else {
        const [subsResponse, vendorsResponse] = await Promise.all([
          api.get('/admin/subscriptions'),
          api.get('/vendors'),
        ]);
        setSubscriptions(subsResponse.data);
        setVendors(vendorsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...planFormData,
        price: parseFloat(planFormData.price),
        limits: {
          vendors: planFormData.limits.vendors ? parseInt(planFormData.limits.vendors) : -1,
          users: planFormData.limits.users ? parseInt(planFormData.limits.users) : -1,
          vehicles: planFormData.limits.vehicles ? parseInt(planFormData.limits.vehicles) : -1,
          storage: planFormData.limits.storage ? parseInt(planFormData.limits.storage) : -1,
        },
      };

      if (editingPlan) {
        await api.put(`/admin/subscriptions/plans/${editingPlan._id}`, formData);
      } else {
        await api.post('/admin/subscriptions/plans', formData);
      }
      
      setShowPlanModal(false);
      setEditingPlan(null);
      resetPlanForm();
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/subscriptions', subscriptionFormData);
      setShowSubscriptionModal(false);
      resetSubscriptionForm();
      fetchData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await api.delete(`/admin/subscriptions/plans/${planId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await api.put(`/admin/subscriptions/${subscriptionId}/cancel`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      displayName: '',
      description: '',
      price: '',
      billingCycle: 'monthly',
      features: [],
      limits: {
        vendors: '',
        users: '',
        vehicles: '',
        storage: '',
      },
      isActive: true,
      isDefault: false,
    });
    setEditingPlan(null);
  };

  const resetSubscriptionForm = () => {
    setSubscriptionFormData({
      vendorId: '',
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      billingCycle: 'monthly',
      autoRenew: true,
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.subscriptions')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage subscription plans and vendor subscriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('admin.subscriptionPlans')}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('admin.vendorSubscriptions')}
          </button>
        </nav>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetPlanForm(); setShowPlanModal(true); }} variant="primary">
              {t('admin.createPlan')}
            </Button>
          </div>

          {loading ? (
            <Card>
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
              </div>
            </Card>
          ) : plans.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('admin.noPlans')}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan._id} className="relative">
                  {plan.isDefault && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{plan.displayName}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">{formatCurrency(plan.price)}</p>
                    <p className="text-sm text-gray-500 capitalize">/{plan.billingCycle}</p>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => {
                        setEditingPlan(plan);
                        setPlanFormData({
                          name: plan.name,
                          displayName: plan.displayName,
                          description: plan.description || '',
                          price: plan.price.toString(),
                          billingCycle: plan.billingCycle,
                          features: plan.features || [],
                          limits: {
                            vendors: plan.limits?.vendors === -1 ? '' : plan.limits?.vendors?.toString() || '',
                            users: plan.limits?.users === -1 ? '' : plan.limits?.users?.toString() || '',
                            vehicles: plan.limits?.vehicles === -1 ? '' : plan.limits?.vehicles?.toString() || '',
                            storage: plan.limits?.storage === -1 ? '' : plan.limits?.storage?.toString() || '',
                          },
                          isActive: plan.isActive,
                          isDefault: plan.isDefault,
                        });
                        setShowPlanModal(true);
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDeletePlan(plan._id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetSubscriptionForm(); setShowSubscriptionModal(true); }} variant="primary">
              {t('admin.assignSubscription')}
            </Button>
          </div>

          {loading ? (
            <Card>
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
              </div>
            </Card>
          ) : subscriptions.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('admin.noSubscriptions')}</p>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('admin.businessName')}
                      </th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('admin.subscriptionPlan')}
                      </th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('admin.startDate')}
                      </th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('admin.endDate')}
                      </th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('admin.status')}
                      </th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm sm:text-base text-gray-800">
                            {subscription.vendorId?.businessName || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {subscription.planId?.displayName || subscription.planId?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">{formatDate(subscription.startDate)}</td>
                        <td className="py-3 px-4 text-gray-700 text-sm">{formatDate(subscription.endDate)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                            {t(`admin.${subscription.status}`)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 sm:gap-2">
                            {subscription.status === 'active' && (
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => handleCancelSubscription(subscription._id)}
                                className="text-xs px-2"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingPlan ? t('admin.editPlan') : t('admin.createPlan')}
            </h2>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.planName')}
                  name="name"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  required
                  disabled={!!editingPlan}
                />
                <Input
                  label={t('admin.displayName')}
                  name="displayName"
                  value={planFormData.displayName}
                  onChange={(e) => setPlanFormData({ ...planFormData, displayName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')}
                </label>
                <textarea
                  name="description"
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('admin.price')}
                  name="price"
                  type="number"
                  step="0.01"
                  value={planFormData.price}
                  onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.billingCycle')}
                  </label>
                  <select
                    name="billingCycle"
                    value={planFormData.billingCycle}
                    onChange={(e) => setPlanFormData({ ...planFormData, billingCycle: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="monthly">{t('admin.monthly')}</option>
                    <option value="quarterly">{t('admin.quarterly')}</option>
                    <option value="yearly">{t('admin.yearly')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={planFormData.isActive}
                    onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">{t('common.active')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={planFormData.isDefault}
                    onChange={(e) => setPlanFormData({ ...planFormData, isDefault: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Default Plan</span>
                </label>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowPlanModal(false); resetPlanForm(); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.assignSubscription')}</h2>
            <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.businessName')} *
                </label>
                <select
                  name="vendorId"
                  value={subscriptionFormData.vendorId}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, vendorId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.businessName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.subscriptionPlan')} *
                </label>
                <select
                  name="planId"
                  value={subscriptionFormData.planId}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, planId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.filter(p => p.isActive).map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.displayName} - {formatCurrency(plan.price)}/{plan.billingCycle}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label={t('admin.startDate')}
                type="date"
                name="startDate"
                value={subscriptionFormData.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, startDate: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.billingCycle')}
                </label>
                <select
                  name="billingCycle"
                  value={subscriptionFormData.billingCycle}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, billingCycle: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">{t('admin.monthly')}</option>
                  <option value="quarterly">{t('admin.quarterly')}</option>
                  <option value="yearly">{t('admin.yearly')}</option>
                </select>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={subscriptionFormData.autoRenew}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, autoRenew: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{t('admin.autoRenew')}</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowSubscriptionModal(false); resetSubscriptionForm(); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;

