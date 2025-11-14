const SupportTicket = require('../models/SupportTicket');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all support tickets (Super Admin)
// @route   GET /api/admin/support/tickets
// @access  Private/Super Admin
const getTickets = asyncHandler(async (req, res) => {
  const { status, priority, category, assignedTo } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;
  
  const tickets = await SupportTicket.find(query)
    .populate('vendorId', 'businessName email')
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
  
  res.json(tickets);
});

// @desc    Get single ticket
// @route   GET /api/admin/support/tickets/:id
// @access  Private/Super Admin
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('vendorId')
    .populate('userId', 'name email role')
    .populate('assignedTo', 'name email')
    .populate('replies.userId', 'name email role');
  
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
  res.json(ticket);
});

// @desc    Create support ticket (can be created by vendor or admin)
// @route   POST /api/admin/support/tickets
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { vendorId, subject, description, category, priority } = req.body;
  
  // If vendorId not provided, use from authenticated user
  const finalVendorId = vendorId || req.user.vendorId;
  
  if (!finalVendorId) {
    return res.status(400).json({ message: 'Vendor ID is required' });
  }
  
  const ticket = await SupportTicket.create({
    vendorId: finalVendorId,
    userId: req.user._id,
    subject,
    description,
    category: category || 'other',
    priority: priority || 'medium',
  });
  
  const populatedTicket = await SupportTicket.findById(ticket._id)
    .populate('vendorId', 'businessName email')
    .populate('userId', 'name email');
  
  res.status(201).json(populatedTicket);
});

// @desc    Update ticket
// @route   PUT /api/admin/support/tickets/:id
// @access  Private/Super Admin
const updateTicket = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo } = req.body;
  
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
  // Update status and set resolved/closed dates
  if (status) {
    ticket.status = status;
    if (status === 'resolved' && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    if (status === 'closed' && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }
  }
  
  if (priority) ticket.priority = priority;
  if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;
  
  ticket.lastActivity = new Date();
  await ticket.save();
  
  const updatedTicket = await SupportTicket.findById(ticket._id)
    .populate('vendorId', 'businessName email')
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email');
  
  res.json(updatedTicket);
});

// @desc    Add reply to ticket
// @route   POST /api/admin/support/tickets/:id/reply
// @access  Private
const addReply = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;
  
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
  // Check if user has permission (Super Admin or ticket owner)
  const isOwner = ticket.userId.toString() === req.user._id.toString();
  const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === 'super_admin';
  
  if (!isOwner && !isAssigned && !isSuperAdmin) {
    return res.status(403).json({ message: 'You do not have permission to reply to this ticket' });
  }
  
  // Update status if it was closed/resolved
  if (ticket.status === 'closed' || ticket.status === 'resolved') {
    ticket.status = 'open';
    ticket.resolvedAt = null;
    ticket.closedAt = null;
  }
  
  ticket.replies.push({
    userId: req.user._id,
    message,
    isInternal: isInternal || false,
  });
  
  ticket.lastActivity = new Date();
  await ticket.save();
  
  const updatedTicket = await SupportTicket.findById(ticket._id)
    .populate('vendorId', 'businessName email')
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email')
    .populate('replies.userId', 'name email role');
  
  res.json(updatedTicket);
});

// @desc    Get ticket statistics
// @route   GET /api/admin/support/stats
// @access  Private/Super Admin
const getTicketStats = asyncHandler(async (req, res) => {
  const totalTickets = await SupportTicket.countDocuments();
  const openTickets = await SupportTicket.countDocuments({ status: 'open' });
  const inProgressTickets = await SupportTicket.countDocuments({ status: 'in_progress' });
  const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
  const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });
  
  // Tickets by priority
  const urgentTickets = await SupportTicket.countDocuments({ priority: 'urgent', status: { $ne: 'closed' } });
  const highTickets = await SupportTicket.countDocuments({ priority: 'high', status: { $ne: 'closed' } });
  
  // Recent tickets (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTickets = await SupportTicket.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });
  
  res.json({
    total: totalTickets,
    open: openTickets,
    inProgress: inProgressTickets,
    resolved: resolvedTickets,
    closed: closedTickets,
    urgent: urgentTickets,
    high: highTickets,
    recent: recentTickets,
  });
});

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  addReply,
  getTicketStats,
};

