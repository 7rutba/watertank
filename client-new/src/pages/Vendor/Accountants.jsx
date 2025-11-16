import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Accountants = () => {
  const [loading, setLoading] = useState(true);
  const [accountants, setAccountants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccountants();
  }, []);

  const fetchAccountants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accountants');
      setAccountants(res.data || []);
    } catch (e) {
      console.error('Error fetching accountants:', e);
      setError(e.response?.data?.message || 'Failed to load accountants');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.post('/accountants', formData);
      setShowModal(false);
      resetForm();
      fetchAccountants();
      alert('Accountant created');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create accountant');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = accountants.filter(a =>
    (a.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (a.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (a.phone || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Accountants</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Accountants</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage accountant users for your vendor</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} variant="primary" className="w-full sm:w-auto">
          Add Accountant
        </Button>
      </div>

      {error && (
        <Card>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        </Card>
      )}

      <Card>
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>No accountants found.</p>
              </div>
            </Card>
          </div>
        ) : (
          filtered.map(a => (
            <Card key={a._id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{a.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {a.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                <div>{a.email}</div>
                {a.phone && <div>{a.phone}</div>}
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Accountant</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accountants;


