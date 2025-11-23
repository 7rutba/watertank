import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import StatsCard from '../../../components/StatsCard';
import LoadingState from '../../../components/LoadingState';
import api from '../../../utils/api';

const SupplierPayments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [supplierOutstanding, setSupplierOutstanding] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);
  const [supplierMonth, setSupplierMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    amount: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      refreshSupplierData(selectedSupplier);
    }
  }, [selectedSupplier, supplierMonth]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data || []);
    } catch (e) {
      console.error('Error fetching suppliers:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshSupplierData = async (supplierId) => {
    if (!supplierId) {
      setSupplierOutstanding(null);
      setSupplierStats(null);
      return;
    }
    try {
      const [outRes, statRes] = await Promise.all([
        api.get(`/suppliers/${supplierId}/outstanding`),
        api.get(`/suppliers/${supplierId}/stats?month=${supplierMonth}`),
      ]);
      setSupplierOutstanding(outRes.data);
      setSupplierStats(statRes.data);
    } catch (e) {
      console.error('Error fetching supplier data:', e);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleMonthlyPayment = async () => {
    if (!selectedSupplier || !supplierStats || !supplierOutstanding) return;
    
    try {
      const amount = (supplierStats.monthly.amount + Math.max(0, (supplierOutstanding.outstanding - supplierStats.monthly.amount)));
      await api.post('/payments', {
        type: 'purchase',
        relatedTo: 'supplier',
        relatedId: selectedSupplier,
        amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: `MONTH-${supplierMonth}`,
        notes: `Monthly supplier payment for ${supplierMonth}`,
      });
      await refreshSupplierData(selectedSupplier);
      alert('Monthly supplier payment recorded');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to record monthly payment');
    }
  };

  const handlePartialPayment = async () => {
    if (!selectedSupplier || !formData.amount) return;
    
    try {
      await api.post('/payments', {
        type: 'purchase',
        relatedTo: 'supplier',
        relatedId: selectedSupplier,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: `PARTIAL-${supplierMonth}`,
        notes: `Partial supplier payment ${supplierMonth}`,
      });
      setFormData({ ...formData, amount: '' });
      await refreshSupplierData(selectedSupplier);
      alert('Partial supplier payment recorded');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to record partial payment');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Supplier Payments" />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  const monthlyPaymentAmount = supplierStats && supplierOutstanding 
    ? (supplierStats.monthly.amount + Math.max(0, (supplierOutstanding.outstanding - supplierStats.monthly.amount)))
    : 0;
  const previousOutstanding = supplierOutstanding && supplierStats
    ? Math.max(0, (supplierOutstanding.outstanding - supplierStats.monthly.amount))
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Supplier Payments"
        subtitle="Manage supplier payment processes"
      />

      {/* Supplier Selection */}
      <Card padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Select supplier...</option>
              {suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <Input
              type="month"
              value={supplierMonth}
              onChange={(e) => setSupplierMonth(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => refreshSupplierData(selectedSupplier)}
              disabled={!selectedSupplier}
              className="w-full"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </Card>

      {supplierStats && supplierOutstanding && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatsCard
              title="This Month Quantity"
              value={`${supplierStats.monthly.quantity} L`}
              icon="💧"
              iconBg="bg-blue-500"
            />
            <StatsCard
              title="This Month Amount"
              value={formatCurrency(supplierStats.monthly.amount)}
              icon="💰"
              iconBg="bg-green-500"
            />
            <StatsCard
              title="Previous Outstanding"
              value={formatCurrency(previousOutstanding)}
              icon="📋"
              iconBg="bg-orange-500"
            />
          </div>

          {/* Monthly Payment */}
          <Card title="Monthly Payment (Fixed Suppliers)" padding="lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                <Input
                  type="text"
                  value={formatCurrency(monthlyPaymentAmount)}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Month total + previous outstanding</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                >
                  <option value="cash">{t('vendor.cash')}</option>
                  <option value="bank_transfer">{t('vendor.bankTransfer')}</option>
                  <option value="upi">{t('vendor.upi')}</option>
                  <option value="cheque">{t('vendor.cheque')}</option>
                  <option value="neft">{t('vendor.neft')}</option>
                  <option value="rtgs">{t('vendor.rtgs')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handleMonthlyPayment}
                  disabled={!selectedSupplier}
                  className="w-full"
                >
                  Process Monthly Payment
                </Button>
              </div>
            </div>
          </Card>

          {/* Partial Payment */}
          <Card title="Mid-Month / On-Demand Payment" padding="lg">
            <div className="space-y-4">
              {supplierOutstanding.unpaidCollections.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
                  {supplierOutstanding.unpaidCollections.slice(0, 20).map(c => (
                    <div key={c._id} className="flex justify-between text-sm border-b pb-2">
                      <span>{new Date(c.createdAt).toLocaleDateString()} • {c.quantity}L</span>
                      <span className="font-medium">{formatCurrency(c.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partial Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="cash">{t('vendor.cash')}</option>
                    <option value="bank_transfer">{t('vendor.bankTransfer')}</option>
                    <option value="upi">{t('vendor.upi')}</option>
                    <option value="cheque">{t('vendor.cheque')}</option>
                    <option value="neft">{t('vendor.neft')}</option>
                    <option value="rtgs">{t('vendor.rtgs')}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handlePartialPayment}
                    disabled={!selectedSupplier || !formData.amount}
                    className="w-full"
                  >
                    Pay Partial
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SupplierPayments;

