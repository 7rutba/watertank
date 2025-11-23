import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Payments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [supplierOutstanding, setSupplierOutstanding] = useState(null);
  const [supplierStats, setSupplierStats] = useState(null);
  const [supplierMonth, setSupplierMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [societyPeriod, setSocietyPeriod] = useState(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10);
    const end = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10);
    return { start, end };
  });
  const [filters, setFilters] = useState({
    type: '',
    relatedTo: '',
    startDate: '',
    endDate: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'purchase',
    relatedTo: 'supplier',
    relatedId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchSuppliers();
    fetchSocieties();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.relatedTo) params.append('relatedTo', filters.relatedTo);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices?status=sent,overdue');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data || []);
    } catch (e) {
      console.error('Error fetching suppliers:', e);
    }
  };

  const fetchSocieties = async () => {
    try {
      const res = await api.get('/societies');
      setSocieties(res.data || []);
    } catch (e) {
      console.error('Error fetching societies:', e);
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
        api.get(`/suppliers/${supplierId}/stats`),
      ]);
      setSupplierOutstanding(outRes.data);
      setSupplierStats(statRes.data);
    } catch (e) {
      console.error('Error fetching supplier data:', e);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/payments', formData);
      setShowModal(false);
      setFormData({
        type: 'purchase',
        relatedTo: 'supplier',
        relatedId: '',
        invoiceId: '',
        amount: '',
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        notes: '',
      });
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: t('vendor.cash'),
      bank_transfer: t('vendor.bankTransfer'),
      upi: t('vendor.upi'),
      cheque: t('vendor.cheque'),
      card: t('vendor.card'),
      neft: t('vendor.neft'),
      rtgs: t('vendor.rtgs'),
    };
    return labels[method] || method;
  };

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.payments')}</h1>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.payments')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Record and track payments</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="primary" className="w-full sm:w-auto">
          {t('vendor.recordPayment')}
        </Button>
      </div>

      {/* Accountant Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Supplier Payment Process */}
        <Card>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Supplier Payment Process</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                <select
                  value={selectedSupplier}
                  onChange={async (e) => { setSelectedSupplier(e.target.value); await refreshSupplierData(e.target.value); }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                <Input
                  type="month"
                  value={supplierMonth}
                  onChange={(e) => setSupplierMonth(e.target.value)}
                  className="mb-0"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => refreshSupplierData(selectedSupplier)}
                  disabled={!selectedSupplier}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {supplierStats && supplierOutstanding && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card>
                  <div className="text-xs text-gray-600">This Month Quantity</div>
                  <div className="text-xl font-semibold">{supplierStats.monthly.quantity} L</div>
                </Card>
                <Card>
                  <div className="text-xs text-gray-600">This Month Amount</div>
                  <div className="text-xl font-semibold">₹{supplierStats.monthly.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </Card>
                <Card>
                  <div className="text-xs text-gray-600">Prev. Outstanding</div>
                  <div className="text-xl font-semibold">₹{Math.max(0, (supplierOutstanding.outstanding - supplierStats.monthly.amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </Card>
              </div>
            )}

            {/* Monthly Payment (Fixed Suppliers) */}
            <Card>
              <h3 className="font-medium mb-2 text-sm sm:text-base">Monthly Payment (Fixed Suppliers)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={supplierStats && supplierOutstanding ? (supplierStats.monthly.amount + Math.max(0, (supplierOutstanding.outstanding - supplierStats.monthly.amount))) : ''}
                    onChange={() => {}}
                    disabled
                    className="mb-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Month total + previous outstanding</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="w-full text-xs sm:text-sm"
                    disabled={!selectedSupplier || !supplierStats || !supplierOutstanding}
                    onClick={async () => {
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
                        fetchPayments();
                        alert('Monthly supplier payment recorded');
                      } catch (e) {
                        alert(e.response?.data?.message || 'Failed to record monthly payment');
                      }
                    }}
                  >
                    <span className="hidden sm:inline">Process Monthly Payment</span>
                    <span className="sm:hidden">Process Payment</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mid-Month Payment (On-Demand) */}
            {supplierOutstanding && (
              <Card>
                <h3 className="font-medium mb-2 text-sm sm:text-base">Mid-Month / On-Demand</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {supplierOutstanding.unpaidCollections.length === 0 ? (
                    <div className="text-xs text-gray-500">No unbilled collections.</div>
                  ) : (
                    supplierOutstanding.unpaidCollections.slice(0, 20).map(c => (
                      <div key={c._id} className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs border-b py-2">
                        <span className="truncate">{new Date(c.createdAt).toLocaleDateString()} • {c.quantity}L</span>
                        <span className="font-medium">₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Partial Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="mb-0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                      className="w-full text-xs sm:text-sm"
                      disabled={!selectedSupplier || !formData.amount}
                      onClick={async () => {
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
                          fetchPayments();
                          alert('Partial supplier payment recorded');
                        } catch (e) {
                          alert(e.response?.data?.message || 'Failed to record partial payment');
                        }
                      }}
                    >
                      Pay Partial
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Temporary Supplier (Per-Collection) */}
            {supplierOutstanding && supplierOutstanding.unpaidCollections.length > 0 && (
              <Card>
                <h3 className="font-medium mb-2 text-sm sm:text-base">Temporary Supplier (Per-Collection)</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {supplierOutstanding.unpaidCollections.slice(0, 20).map(c => (
                    <div key={c._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs border-b py-2">
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{new Date(c.createdAt).toLocaleDateString()} • {c.quantity}L @ ₹{Number(c.purchaseRate).toFixed(2)}/L</div>
                        <div className="text-gray-500">Total: ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await api.post('/payments', {
                              type: 'purchase',
                              relatedTo: 'supplier',
                              relatedId: selectedSupplier,
                              collectionId: c._id,
                              amount: Number(c.totalAmount),
                              paymentMethod: formData.paymentMethod,
                              paymentDate: new Date().toISOString().split('T')[0],
                              referenceNumber: `COL-${c._id}`,
                              notes: 'Per-collection payout',
                            });
                            await refreshSupplierData(selectedSupplier);
                            fetchPayments();
                            alert('Per-collection supplier payment recorded');
                          } catch (e) {
                            alert(e.response?.data?.message || 'Failed to record per-collection payment');
                          }
                        }}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        Pay Now
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </Card>

        {/* Society Invoicing & Payments */}
        <Card>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Society Payments & Invoicing</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Society</label>
                <select
                  value={selectedSociety}
                  onChange={(e) => setSelectedSociety(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select society...</option>
                  {societies.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Period Start</label>
                <Input
                  type="date"
                  value={societyPeriod.start}
                  onChange={(e) => setSocietyPeriod({ ...societyPeriod, start: e.target.value })}
                  className="mb-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Period End</label>
                <Input
                  type="date"
                  value={societyPeriod.end}
                  onChange={(e) => setSocietyPeriod({ ...societyPeriod, end: e.target.value })}
                  className="mb-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    if (!selectedSociety) {
                      alert('Select a society');
                      return;
                    }
                    const res = await api.post('/invoices/generate-monthly', {
                      relatedId: selectedSociety,
                      relatedTo: 'society',
                      startDate: societyPeriod.start,
                      endDate: societyPeriod.end,
                    });
                    fetchInvoices();
                    alert(`Invoice drafted: ${res.data.invoiceNumber || res.data._id}`);
                  } catch (e) {
                    alert(e.response?.data?.message || 'Failed to generate invoice');
                  }
                }}
                className="w-full"
              >
                Generate Monthly Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowModal(true)}
                className="w-full"
              >
                Record Society Payment
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.paymentType')}</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="delivery">Delivery</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.relatedTo')}</label>
            <select
              name="relatedTo"
              value={filters.relatedTo}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All</option>
              <option value="supplier">Supplier</option>
              <option value="society">Society</option>
              <option value="driver">Driver</option>
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
            <Input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mb-0"
            />
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalPayments')}</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{payments.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">{t('vendor.totalAmount')}</div>
          <div className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {payments.filter(p => p.status === 'completed').length}
          </div>
        </Card>
      </div>

      {/* Payments Table - Desktop View */}
      <Card className="overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.paymentType')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.relatedTo')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.paymentMethod')}</th>
                <th className="px-3 xl:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.amount')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.referenceNumber')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {t('vendor.noPayments')}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{formatDate(payment.paymentDate)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900 capitalize">
                      <div className="whitespace-nowrap">{payment.type}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900 capitalize">
                      <div className="whitespace-nowrap">{payment.relatedTo}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="whitespace-nowrap">{getPaymentMethodLabel(payment.paymentMethod)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      <div className="whitespace-nowrap">{formatCurrency(payment.amount || 0)}</div>
                    </td>
                    <td className="px-3 xl:px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 xl:px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-[120px] truncate" title={payment.referenceNumber || '-'}>
                        {payment.referenceNumber || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden">
          {payments.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              {t('vendor.noPayments')}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {payments.map((payment) => (
                <div key={payment._id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.paymentType')}:</span>
                      <div className="font-medium text-gray-900 capitalize">{payment.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.relatedTo')}:</span>
                      <div className="font-medium text-gray-900 capitalize">{payment.relatedTo}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.paymentMethod')}:</span>
                      <div className="font-medium text-gray-900">{getPaymentMethodLabel(payment.paymentMethod)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">{t('vendor.referenceNumber')}:</span>
                      <div className="font-medium text-gray-900">{payment.referenceNumber || '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-4 sm:p-6 my-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t('vendor.recordPayment')}</h2>
              <button
                onClick={() => { setShowModal(false); setFormData({ type: 'purchase', relatedTo: 'supplier', relatedId: '', invoiceId: '', amount: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], referenceNumber: '', notes: '' }); }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.paymentType')} *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="purchase">{t('vendor.purchase')}</option>
                    <option value="delivery">{t('vendor.delivery')}</option>
                    <option value="expense">{t('vendor.expense')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.relatedTo')} *</label>
                  <select
                    value={formData.relatedTo}
                    onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value, relatedId: '' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="supplier">Supplier</option>
                    <option value="society">Society</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.relatedTo === 'supplier' ? 'Supplier' : formData.relatedTo === 'society' ? 'Society' : 'Driver'} *
                </label>
                <select
                  value={formData.relatedId}
                  onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Select...</option>
                  {(formData.relatedTo === 'supplier' ? suppliers : formData.relatedTo === 'society' ? societies : []).map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              </div>
              
              {formData.type === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice (Optional)</label>
                  <select
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select Invoice...</option>
                    {invoices.filter(inv => inv.relatedTo === formData.relatedTo).map(invoice => (
                      <option key={invoice._id} value={invoice._id}>
                        {invoice.invoiceNumber} - {formatCurrency(invoice.total)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.amount')} *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.paymentMethod')} *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    required
                  >
                    <option value="cash">{t('vendor.cash')}</option>
                    <option value="bank_transfer">{t('vendor.bankTransfer')}</option>
                    <option value="upi">{t('vendor.upi')}</option>
                    <option value="cheque">{t('vendor.cheque')}</option>
                    <option value="card">{t('vendor.card')}</option>
                    <option value="neft">{t('vendor.neft')}</option>
                    <option value="rtgs">{t('vendor.rtgs')}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.paymentDate')} *</label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.referenceNumber')}</label>
                  <Input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendor.notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={submitting} className="w-full sm:flex-1">
                  {submitting ? t('common.loading') : t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); setFormData({ type: 'purchase', relatedTo: 'supplier', relatedId: '', invoiceId: '', amount: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], referenceNumber: '', notes: '' }); }}
                  className="w-full sm:flex-1"
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

export default Payments;

