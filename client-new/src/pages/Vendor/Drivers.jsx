import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../utils/api';

const Drivers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverStats, setDriverStats] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0,10));
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const d = new Date(); 
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [salarySummary, setSalarySummary] = useState(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const attendanceSectionRef = useRef(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, half: 0, absent: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dailyWage: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError(error.response?.data?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverAttendance = async (driverId, month) => {
    try {
      const res = await api.get(`/drivers/${driverId}/attendance?month=${month}`);
      setAttendanceRecords(res.data.records || []);
      setAttendanceSummary(res.data.summary || { present: 0, half: 0, absent: 0 });
    } catch (e) {
      console.error('Error fetching attendance:', e);
    }
  };

  const fetchDriverDetails = async (driverId) => {
    try {
      const [driverResponse, statsResponse] = await Promise.all([
        api.get(`/drivers/${driverId}`),
        api.get(`/drivers/${driverId}/stats`),
      ]);
      setSelectedDriver(driverResponse.data);
      setDriverStats(statsResponse.data);
      setShowDetailsModal(true);
      try {
        const m = new Date(attendanceDate).toISOString().slice(0,7);
        const att = await api.get(`/drivers/${driverId}/attendance?month=${m}`);
        const todayRec = att.data.records.find(r => (r.date || '').slice(0,10) === attendanceDate);
        if (todayRec) setAttendanceStatus(todayRec.status);
      } catch {}
    } catch (error) {
      console.error('Error fetching driver details:', error);
      alert(error.response?.data?.message || 'Failed to load driver details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (selectedDriver) {
        // Update existing driver
        await api.put(`/drivers/${selectedDriver._id}`, {
          ...formData,
          dailyWage: parseFloat(formData.dailyWage) || 0,
        });
      } else {
        // Create new driver
        await api.post('/drivers', {
          ...formData,
          dailyWage: parseFloat(formData.dailyWage) || 0,
        });
      }
      setShowModal(false);
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      setError(error.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      await api.delete(`/drivers/${driverId}`);
      fetchDrivers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete driver');
    }
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: '', // Don't pre-fill password
      phone: driver.phone || '',
      dailyWage: (driver.dailyWage ?? 0).toString(),
      isActive: driver.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      dailyWage: '',
      isActive: true,
    });
    setSelectedDriver(null);
    setError('');
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.drivers')}</h1>
        </div>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('vendor.drivers')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your drivers</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          variant="primary"
          className="w-full sm:w-auto"
        >
          {t('vendor.addDriver')}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <Input
          type="text"
          placeholder="Search drivers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </Card>

      {/* Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-gray-500">
                <p>{t('vendor.noDrivers')}</p>
              </div>
            </Card>
          </div>
        ) : (
          filteredDrivers.map((driver) => (
            <Card key={driver._id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{driver.name}</h3>
                  <p className="text-sm text-gray-600">{driver.email}</p>
                  {driver.phone && (
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    driver.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {driver.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => fetchDriverDetails(driver._id)}
                  className="flex-1"
                >
                  {t('vendor.viewDetails')}
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={async () => {
                    setSelectedDriver(driver);
                    setShowAttendanceModal(true);
                    setOpenAttendance(false);
                    // preload month attendance
                    await fetchDriverAttendance(driver._id, attendanceMonth);
                    // preload today's status for quick mark
                    try {
                      const todayMonth = new Date().toISOString().slice(0,7);
                      const res = await api.get(`/drivers/${driver._id}/attendance?month=${todayMonth}`);
                      const todayStr = new Date().toISOString().slice(0,10);
                      const todayRec = (res.data.records || []).find(r => (r.date || '').slice(0,10) === todayStr);
                      if (todayRec) {
                        setAttendanceDate(todayStr);
                        setAttendanceStatus(todayRec.status);
                      } else {
                        setAttendanceDate(todayStr);
                        setAttendanceStatus('present');
                      }
                    } catch {}
                  }}
                  className="flex-1"
                >
                  Mark Attendance / Salary
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleEdit(driver)}
                  className="flex-1"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => handleDelete(driver._id)}
                  className="flex-1"
                >
                  {t('common.delete')}
                </Button>
              </div>
              
              {driver.lastLogin && (
                <p className="text-xs text-gray-500 mt-2">
                  Last login: {formatDate(driver.lastLogin)}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedDriver ? t('vendor.editDriver') : t('vendor.addDriver')}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('vendor.driverName')}
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label={t('vendor.driverEmail')}
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label={t('vendor.driverPhone')}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Daily Wage (₹)"
                type="number"
                name="dailyWage"
                value={formData.dailyWage}
                onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
              {!selectedDriver && (
                <Input
                  label={t('vendor.driverPassword')}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty for default password (driver123)"
                />
              )}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{t('common.active')}</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedDriver.name}</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedDriver(null); setDriverStats(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Driver Info */}
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.driverInfo')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('vendor.driverEmail')}:</span>
                    <span className="ml-2 font-medium">{selectedDriver.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('vendor.driverPhone')}:</span>
                    <span className="ml-2 font-medium">{selectedDriver.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('common.status')}:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedDriver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  {selectedDriver.lastLogin && (
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedDriver.lastLogin)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Vehicle Assignment */}
              {selectedDriver.stats?.vehicle && (
                <Card>
                  <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.assignedVehicle')}</h3>
                  <p className="text-sm">
                    <span className="font-medium">{selectedDriver.stats.vehicle.vehicleNumber}</span>
                    <span className="text-gray-600 ml-2">({selectedDriver.stats.vehicle.vehicleType})</span>
                  </p>
                </Card>
              )}

              {/* Statistics */}
              {driverStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.todayStats')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.deliveries')}:</span>
                        <span className="font-medium">{driverStats.today.deliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.revenue')}:</span>
                        <span className="font-medium">{formatCurrency(driverStats.today.revenue)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.monthlyStats')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.deliveries')}:</span>
                        <span className="font-medium">{driverStats.monthly.deliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.revenue')}:</span>
                        <span className="font-medium">{formatCurrency(driverStats.monthly.revenue)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card>
                    <h3 className="font-semibold text-gray-800 mb-3">{t('vendor.totalStats')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.deliveries')}:</span>
                        <span className="font-medium">{driverStats.total.deliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.collections')}:</span>
                        <span className="font-medium">{driverStats.total.collections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendor.expenses')}:</span>
                        <span className="font-medium">{driverStats.total.expenses}</span>
                      </div>
                    </div>
                  </Card>
                  
                  {selectedDriver.stats?.pendingExpenses > 0 && (
                    <Card>
                      <h3 className="font-semibold text-yellow-800 mb-3">{t('vendor.pendingExpenses')}</h3>
                      <p className="text-2xl font-bold text-yellow-600">{selectedDriver.stats.pendingExpenses}</p>
                    </Card>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleEdit(selectedDriver)}
                className="flex-1"
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowDetailsModal(false); setSelectedDriver(null); setDriverStats(null); }}
                className="flex-1"
              >
                {t('common.close')}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Attendance & Salary Modal */}
      {showAttendanceModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedDriver.name} • Attendance & Salary</h2>
              <button
                onClick={() => { setShowAttendanceModal(false); setSelectedDriver(null); setSalarySummary(null); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">Mark Attendance</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                      <Input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="mb-0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={attendanceStatus}
                        onChange={(e) => setAttendanceStatus(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="present">Present</option>
                        <option value="half">Half Day</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      try {
                        setSavingAttendance(true);
                        await api.post(`/drivers/${selectedDriver._id}/attendance`, { date: attendanceDate, status: attendanceStatus });
                        await fetchDriverAttendance(selectedDriver._id, attendanceMonth);
                        alert('Attendance saved');
                      } catch (e) {
                        alert(e.response?.data?.message || 'Failed to save attendance');
                      } finally {
                        setSavingAttendance(false);
                      }
                    }}
                    disabled={savingAttendance}
                  >
                    {savingAttendance ? t('common.loading') : 'Save Attendance'}
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-green-50 rounded text-center">
                      <div className="text-xs text-gray-600">Present</div>
                      <div className="font-semibold text-green-700">{attendanceSummary.present}</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-center">
                      <div className="text-xs text-gray-600">Half</div>
                      <div className="font-semibold text-yellow-700">{attendanceSummary.half}</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded text-center">
                      <div className="text-xs text-gray-600">Absent</div>
                      <div className="font-semibold text-red-700">{attendanceSummary.absent}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                    <Input
                      type="month"
                      value={attendanceMonth}
                      onChange={async (e) => {
                        const m = e.target.value;
                        setAttendanceMonth(m);
                        await fetchDriverAttendance(selectedDriver._id, m);
                      }}
                      className="mb-0"
                    />
                  </div>

                  <div className="mt-3 max-h-56 overflow-y-auto border rounded">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.length === 0 ? (
                          <tr>
                            <td className="p-3 text-center text-gray-500" colSpan="3">No records</td>
                          </tr>
                        ) : (
                          attendanceRecords.map(r => (
                            <tr key={r._id} className="border-t">
                              <td className="p-2">{(r.date || '').slice(0,10)}</td>
                              <td className="p-2 capitalize">{r.status}</td>
                              <td className="p-2">{r.note || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">Salary (per month)</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                      <Input
                        type="month"
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="mb-0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Daily Wage (₹)</label>
                      <Input
                        type="number"
                        value={selectedDriver?.dailyWage ?? 0}
                        onChange={(e) => setSelectedDriver({ ...selectedDriver, dailyWage: parseFloat(e.target.value) || 0 })}
                        className="mb-0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={async () => {
                        try {
                          await api.put(`/drivers/${selectedDriver._id}`, { dailyWage: selectedDriver.dailyWage });
                          const resp = await api.get(`/drivers/${selectedDriver._id}/salary?month=${salaryMonth}`);
                          setSalarySummary(resp.data);
                        } catch (e) {
                          alert(e.response?.data?.message || 'Failed to calculate salary');
                        }
                      }}
                      className="flex-1"
                    >
                      Calculate Salary
                    </Button>
                  </div>
                  {salarySummary && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Present Days</span>
                        <span>{salarySummary.attendance.presentDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Half Days</span>
                        <span>{salarySummary.attendance.halfDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendance Units</span>
                        <span>{salarySummary.attendance.attendanceUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gross Pay</span>
                        <span>₹{Number(salarySummary.grossPay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-red-700">
                        <span>Driver Expenses (excl. fuel)</span>
                        <span>- ₹{Number(salarySummary.driverExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Net Pay</span>
                        <span>₹{Number(salarySummary.netPay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;

