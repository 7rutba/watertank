const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Super Admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Super Admin
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // Total vendors
  const totalVendors = await Vendor.countDocuments();
  const activeVendors = await Vendor.countDocuments({ isActive: true });
  
  // Total users
  const totalUsers = await User.countDocuments();
  
  // Calculate total revenue from all vendors
  const allDeliveries = await Delivery.find({ status: 'completed' });
  const totalRevenue = allDeliveries.reduce((sum, delivery) => sum + (delivery.totalAmount || 0), 0);
  
  // Calculate growth percentages (comparing last month to previous month)
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
  
  // Vendors growth
  const vendorsLastMonth = await Vendor.countDocuments({
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
  });
  const vendorsPreviousMonth = await Vendor.countDocuments({
    createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
  });
  const vendorsGrowth = vendorsPreviousMonth > 0 
    ? ((vendorsLastMonth - vendorsPreviousMonth) / vendorsPreviousMonth * 100).toFixed(1)
    : vendorsLastMonth > 0 ? '100' : '0';
  
  // Active vendors growth
  const activeVendorsLastMonth = await Vendor.countDocuments({
    isActive: true,
    updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
  });
  const activeVendorsPreviousMonth = await Vendor.countDocuments({
    isActive: true,
    updatedAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
  });
  const activeVendorsGrowth = activeVendorsPreviousMonth > 0
    ? ((activeVendorsLastMonth - activeVendorsPreviousMonth) / activeVendorsPreviousMonth * 100).toFixed(1)
    : activeVendorsLastMonth > 0 ? '100' : '0';
  
  // Revenue growth
  const revenueLastMonth = allDeliveries
    .filter(d => d.createdAt >= lastMonthStart && d.createdAt <= lastMonthEnd)
    .reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  const revenuePreviousMonth = allDeliveries
    .filter(d => d.createdAt >= previousMonthStart && d.createdAt <= previousMonthEnd)
    .reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  const revenueGrowth = revenuePreviousMonth > 0
    ? ((revenueLastMonth - revenuePreviousMonth) / revenuePreviousMonth * 100).toFixed(1)
    : revenueLastMonth > 0 ? '100' : '0';
  
  // Users growth
  const usersLastMonth = await User.countDocuments({
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
  });
  const usersPreviousMonth = await User.countDocuments({
    createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
  });
  const usersGrowth = usersPreviousMonth > 0
    ? ((usersLastMonth - usersPreviousMonth) / usersPreviousMonth * 100).toFixed(1)
    : usersLastMonth > 0 ? '100' : '0';
  
  res.json({
    totalVendors,
    activeVendors,
    totalUsers,
    totalRevenue,
    growth: {
      vendors: vendorsGrowth,
      activeVendors: activeVendorsGrowth,
      revenue: revenueGrowth,
      users: usersGrowth,
    },
  });
});

// @desc    Get recent activities for Super Admin
// @route   GET /api/admin/dashboard/recent-activity
// @access  Private/Super Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const activities = [];
  
  // Recent vendor registrations
  const recentVendors = await Vendor.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('businessName createdAt');
  
  recentVendors.forEach(vendor => {
    activities.push({
      id: `vendor-${vendor._id}`,
      type: 'vendor_registered',
      action: 'New vendor registered',
      vendor: vendor.businessName,
      time: vendor.createdAt,
      icon: '🏢',
    });
  });
  
  // Recent subscriptions/renewals (using vendor updates as proxy)
  const recentVendorUpdates = await Vendor.find({
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  })
    .sort({ updatedAt: -1 })
    .limit(3)
    .select('businessName updatedAt subscriptionPlan');
  
  recentVendorUpdates.forEach(vendor => {
    activities.push({
      id: `subscription-${vendor._id}`,
      type: 'subscription_renewed',
      action: 'Subscription renewed',
      vendor: vendor.businessName,
      plan: vendor.subscriptionPlan || 'basic',
      time: vendor.updatedAt,
      icon: '💳',
    });
  });
  
  // Recent payments
  const recentPayments = await Payment.find()
    .populate('vendorId', 'businessName')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('amount vendorId createdAt');
  
  recentPayments.forEach(payment => {
    if (payment.vendorId) {
      activities.push({
        id: `payment-${payment._id}`,
        type: 'payment_received',
        action: 'Payment received',
        vendor: payment.vendorId.businessName,
        amount: payment.amount,
        time: payment.createdAt,
        icon: '💰',
      });
    }
  });
  
  // Sort by time and limit
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));
  const limitedActivities = activities.slice(0, limit);
  
  // Format time for display
  const formattedActivities = limitedActivities.map(activity => {
    const timeDiff = Date.now() - new Date(activity.time).getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    let timeAgo;
    if (days > 0) {
      timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = 'Just now';
    }
    
    return {
      ...activity,
      time: timeAgo,
      timestamp: activity.time,
    };
  });
  
  res.json(formattedActivities);
});

// @desc    Get system statistics
// @route   GET /api/admin/dashboard/system-stats
// @access  Private/Super Admin
const getSystemStats = asyncHandler(async (req, res) => {
  // Platform uptime (mock for now, can be enhanced with actual monitoring)
  const platformUptime = '99.9%';
  
  // Active sessions (users logged in within last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const activeSessions = await User.countDocuments({
    lastLogin: { $gte: oneHourAgo }
  });
  
  // API requests today (mock for now, can be enhanced with actual logging)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const apiRequestsToday = Math.floor(Math.random() * 5000) + 10000; // Mock data
  
  // Storage used (mock for now, can be enhanced with actual storage calculation)
  const storageUsed = '45%';
  
  res.json({
    platformUptime,
    activeSessions,
    apiRequestsToday,
    storageUsed,
  });
});

module.exports = {
  getAdminDashboardStats,
  getRecentActivity,
  getSystemStats,
};

