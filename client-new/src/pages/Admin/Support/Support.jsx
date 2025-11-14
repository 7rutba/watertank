import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import api from '../../../utils/api';

const Support = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    vendorId: '',
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchVendors();
    fetchUsers();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      
      const response = await api.get(`/admin/support/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/support/tickets/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch admin users for assignment
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      // If endpoint doesn't exist, use empty array
      setUsers([]);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/support/tickets', ticketFormData);
      setShowTicketModal(false);
      resetTicketForm();
      fetchTickets();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    try {
      await api.post(`/admin/support/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage,
        isInternal: isInternalNote,
      });
      setShowReplyModal(false);
      setReplyMessage('');
      setIsInternalNote(false);
      await fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
      fetchStats();
      if (selectedTicket && selectedTicket._id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}`, { priority: newPriority });
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update priority');
    }
  };

  const handleAssign = async (ticketId, userId) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}`, { assignedTo: userId });
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await api.get(`/admin/support/tickets/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const resetTicketForm = () => {
    setTicketFormData({
      vendorId: '',
      subject: '',
      description: '',
      category: 'other',
      priority: 'medium',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || colors.open;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.support')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t('admin.ticketManagement')}</p>
        </div>
        <Button onClick={() => { resetTicketForm(); setShowTicketModal(true); }} variant="primary">
          {t('admin.createTicket')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-800">{stats.total || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.totalTickets')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.open || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.open')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-yellow-600">{stats.inProgress || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.inProgress')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600">{stats.resolved || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.resolved')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-gray-600">{stats.closed || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.closed')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-red-600">{stats.urgent || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.urgent')}</div>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.recent || 0}</div>
          <div className="text-xs sm:text-sm text-gray-600">{t('admin.recentTickets')}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {t('admin.status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="open">{t('admin.open')}</option>
              <option value="in_progress">{t('admin.inProgress')}</option>
              <option value="resolved">{t('admin.resolved')}</option>
              <option value="closed">{t('admin.closed')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {t('admin.priority')}
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Priorities</option>
              <option value="low">{t('admin.low')}</option>
              <option value="medium">{t('admin.medium')}</option>
              <option value="high">{t('admin.high')}</option>
              <option value="urgent">{t('admin.urgent')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {t('admin.category')}
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              <option value="technical">{t('admin.technical')}</option>
              <option value="billing">{t('admin.billing')}</option>
              <option value="account">{t('admin.account')}</option>
              <option value="feature_request">{t('admin.featureRequest')}</option>
              <option value="bug">{t('admin.bug')}</option>
              <option value="other">{t('admin.other')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>{t('admin.noTickets')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?._id === ticket._id
                        ? 'border-primary bg-primary-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => fetchTicketDetails(ticket._id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-gray-800">
                            {ticket.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                            {t(`admin.${ticket.status}`)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                            {t(`admin.${ticket.priority}`)}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-1 truncate">{ticket.subject}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{ticket.vendorId?.businessName || 'N/A'}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ticket Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <Card>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{selectedTicket.ticketNumber}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedTicket.status)}`}>
                        {t(`admin.${selectedTicket.status}`)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{selectedTicket.subject}</h4>
                    <p className="text-sm text-gray-600 mb-4">{selectedTicket.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">{t('admin.category')}:</span>
                        <span className="ml-1 font-medium capitalize">{selectedTicket.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.priority')}:</span>
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(selectedTicket.priority)}`}>
                          {t(`admin.${selectedTicket.priority}`)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.businessName')}:</span>
                        <span className="ml-1 font-medium">{selectedTicket.vendorId?.businessName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('admin.assignedTo')}:</span>
                        <span className="ml-1 font-medium">{selectedTicket.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                      >
                        <option value="open">{t('admin.open')}</option>
                        <option value="in_progress">{t('admin.inProgress')}</option>
                        <option value="resolved">{t('admin.resolved')}</option>
                        <option value="closed">{t('admin.closed')}</option>
                      </select>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => handlePriorityChange(selectedTicket._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                      >
                        <option value="low">{t('admin.low')}</option>
                        <option value="medium">{t('admin.medium')}</option>
                        <option value="high">{t('admin.high')}</option>
                        <option value="urgent">{t('admin.urgent')}</option>
                      </select>
                    </div>
                    <Button
                      size="small"
                      variant="primary"
                      className="w-full"
                      onClick={() => setShowReplyModal(true)}
                    >
                      {t('admin.addReply')}
                    </Button>
                  </div>

                  {/* Replies */}
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-sm text-gray-800 mb-3">{t('admin.reply')}</h5>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTicket.replies?.map((reply, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">
                              {reply.userId?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt || new Date())}
                            </span>
                          </div>
                          {reply.isInternal && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mb-1 inline-block">
                              {t('admin.internalNote')}
                            </span>
                          )}
                          <p className="text-gray-700">{reply.message}</p>
                        </div>
                      ))}
                      {(!selectedTicket.replies || selectedTicket.replies.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No replies yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Select a ticket to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.createTicket')}</h2>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.businessName')} *
                </label>
                <select
                  name="vendorId"
                  value={ticketFormData.vendorId}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, vendorId: e.target.value })}
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
              <Input
                label={t('admin.subject')}
                name="subject"
                value={ticketFormData.subject}
                onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.description')} *
                </label>
                <textarea
                  name="description"
                  value={ticketFormData.description}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.category')}
                  </label>
                  <select
                    name="category"
                    value={ticketFormData.category}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, category: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technical">{t('admin.technical')}</option>
                    <option value="billing">{t('admin.billing')}</option>
                    <option value="account">{t('admin.account')}</option>
                    <option value="feature_request">{t('admin.featureRequest')}</option>
                    <option value="bug">{t('admin.bug')}</option>
                    <option value="other">{t('admin.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.priority')}
                  </label>
                  <select
                    name="priority"
                    value={ticketFormData.priority}
                    onChange={(e) => setTicketFormData({ ...ticketFormData, priority: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">{t('admin.low')}</option>
                    <option value="medium">{t('admin.medium')}</option>
                    <option value="high">{t('admin.high')}</option>
                    <option value="urgent">{t('admin.urgent')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowTicketModal(false); resetTicketForm(); }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.addReply')}</h2>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.reply')} *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{t('admin.internalNote')}</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" className="flex-1">
                  {t('common.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowReplyModal(false); setReplyMessage(''); setIsInternalNote(false); }}
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

export default Support;

