import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import LoadingState from '../../../components/LoadingState';
import api from '../../../utils/api';

const SocietyPayments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState('');
  const [societyPeriod, setSocietyPeriod] = useState(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10);
    const end = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10);
    return { start, end };
  });

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const res = await api.get('/societies');
      setSocieties(res.data || []);
    } catch (e) {
      console.error('Error fetching societies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedSociety) {
      alert('Select a society');
      return;
    }
    try {
      const res = await api.post('/invoices/generate-monthly', {
        relatedId: selectedSociety,
        relatedTo: 'society',
        startDate: societyPeriod.start,
        endDate: societyPeriod.end,
      });
      alert(`Invoice drafted: ${res.data.invoiceNumber || res.data._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to generate invoice');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Society Payments" />
        <LoadingState message={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Society Payments"
        subtitle="Generate invoices and record payments from societies"
      />

      {/* Society Selection & Invoice Generation */}
      <Card title="Invoice Generation" padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Society</label>
              <select
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">Select society...</option>
                {societies.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Start</label>
              <Input
                type="date"
                value={societyPeriod.start}
                onChange={(e) => setSocietyPeriod({ ...societyPeriod, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period End</label>
              <Input
                type="date"
                value={societyPeriod.end}
                onChange={(e) => setSocietyPeriod({ ...societyPeriod, end: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleGenerateInvoice}
              disabled={!selectedSociety}
            >
              Generate Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/vendor/payments/record?type=delivery&relatedTo=society'}
            >
              Record Society Payment
            </Button>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card title="How to Process Society Payments" padding="lg">
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <div>
              <strong>Generate Invoice:</strong> Select a society and custom date range, then generate the invoice for that period.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <div>
              <strong>Send Invoice:</strong> Go to Invoices page to review and send the invoice to the society.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <div>
              <strong>Record Payment:</strong> When society makes payment, use "Record Society Payment" button or go to Record Payment page.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SocietyPayments;

