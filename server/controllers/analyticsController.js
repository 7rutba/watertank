const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to get date range based on period
const getDateRange = (period, startDate, endDate) => {
  const now = new Date();
  let start, end = now;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (period) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1); // Default to monthly
  }

  return { start, end };
};

// @desc    Get analytics overview
// @route   GET /api/admin/analytics/overview
// @access  Private (Super Admin)
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const totalVendors = await Vendor.countDocuments();
  const activeVendors = await Vendor.countDocuments({ status: 'active' });
  const totalUsers = await User.countDocuments();
  
  // Count users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const usersByRoleObj = {};
  usersByRole.forEach(item => {
    usersByRoleObj[item._id] = item.count;
  });

  // Calculate total revenue from all invoices
  const revenueData = await Invoice.aggregate([
    {
      $match: { status: 'paid' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Count active subscriptions
  const activeSubscriptions = await Subscription.countDocuments({ 
    status: 'active',
    endDate: { $gte: new Date() }
  });

  // Count total transactions
  const totalCollections = await Collection.countDocuments();
  const totalDeliveries = await Delivery.countDocuments();
  const totalTransactions = totalCollections + totalDeliveries;

  // Calculate platform growth rate (vendors added in last 30 days vs previous 30 days)
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const vendorsLast30Days = await Vendor.countDocuments({
    createdAt: { $gte: last30Days }
  });
  
  const vendorsPrevious30Days = await Vendor.countDocuments({
    createdAt: { $gte: last60Days, $lt: last30Days }
  });

  const platformGrowthRate = vendorsPrevious30Days > 0
    ? ((vendorsLast30Days - vendorsPrevious30Days) / vendorsPrevious30Days) * 100
    : vendorsLast30Days > 0 ? 100 : 0;

  res.json({
    totalVendors,
    activeVendors,
    totalUsers,
    usersByRole: usersByRoleObj,
    totalRevenue,
    activeSubscriptions,
    totalTransactions,
    platformGrowthRate: Math.round(platformGrowthRate * 100) / 100,
  });
});

// @desc    Get revenue trends
// @route   GET /api/admin/analytics/revenue
// @access  Private (Super Admin)
const getRevenueTrends = asyncHandler(async (req, res) => {
  const { period = 'monthly', startDate, endDate } = req.query;
  const { start, end } = getDateRange(period, startDate, endDate);

  let groupFormat;
  switch (period) {
    case 'daily':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paidDate' } };
      break;
    case 'weekly':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$paidDate' } };
      break;
    case 'yearly':
      groupFormat = { $dateToString: { format: '%Y', date: '$paidDate' } };
      break;
    default: // monthly
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$paidDate' } };
  }

  const revenueData = await Invoice.aggregate([
    {
      $match: {
        status: 'paid',
        paidDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$total' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const data = revenueData.map(item => ({
    date: item._id,
    revenue: item.revenue,
    count: item.count
  }));

  res.json({
    period,
    startDate: start,
    endDate: end,
    data
  });
});

// @desc    Get vendor growth trends
// @route   GET /api/admin/analytics/vendors-growth
// @access  Private (Super Admin)
const getVendorsGrowth = asyncHandler(async (req, res) => {
  const { period = 'monthly', startDate, endDate } = req.query;
  const { start, end } = getDateRange(period, startDate, endDate);

  let groupFormat;
  switch (period) {
    case 'daily':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'weekly':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'yearly':
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    default: // monthly
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }

  const vendorsData = await Vendor.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupFormat,
        newVendors: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Calculate cumulative total vendors
  let cumulativeTotal = await Vendor.countDocuments({ createdAt: { $lt: start } });
  
  const data = vendorsData.map(item => {
    cumulativeTotal += item.newVendors;
    return {
      date: item._id,
      newVendors: item.newVendors,
      totalVendors: cumulativeTotal
    };
  });

  res.json({
    period,
    startDate: start,
    endDate: end,
    data
  });
});

// @desc    Get user growth trends
// @route   GET /api/admin/analytics/users-growth
// @access  Private (Super Admin)
const getUsersGrowth = asyncHandler(async (req, res) => {
  const { period = 'monthly', startDate, endDate } = req.query;
  const { start, end } = getDateRange(period, startDate, endDate);

  let groupFormat;
  switch (period) {
    case 'daily':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'weekly':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'yearly':
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    default: // monthly
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }

  const usersData = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          date: groupFormat,
          role: '$role'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  // Group by date and role
  const dataByDate = {};
  usersData.forEach(item => {
    const date = item._id.date;
    const role = item._id.role;
    if (!dataByDate[date]) {
      dataByDate[date] = { date };
    }
    dataByDate[date][role] = item.count;
  });

  const data = Object.values(dataByDate);

  res.json({
    period,
    startDate: start,
    endDate: end,
    data
  });
});

// @desc    Get subscription statistics
// @route   GET /api/admin/analytics/subscriptions-stats
// @access  Private (Super Admin)
const getSubscriptionsStats = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ status: 'active' })
    .populate('planId', 'name price');

  const distribution = {};
  let totalRevenue = 0;

  subscriptions.forEach(sub => {
    const planName = sub.planId?.name || 'Unknown';
    if (!distribution[planName]) {
      distribution[planName] = 0;
    }
    distribution[planName]++;
    
    if (sub.planId?.price) {
      totalRevenue += sub.planId.price;
    }
  });

  const averageRevenue = subscriptions.length > 0 
    ? totalRevenue / subscriptions.length 
    : 0;

  res.json({
    distribution,
    totalRevenue,
    averageRevenue: Math.round(averageRevenue * 100) / 100,
    totalSubscriptions: subscriptions.length
  });
});

// @desc    Get transaction volume trends
// @route   GET /api/admin/analytics/transactions
// @access  Private (Super Admin)
const getTransactionsTrends = asyncHandler(async (req, res) => {
  const { period = 'monthly', startDate, endDate } = req.query;
  const { start, end } = getDateRange(period, startDate, endDate);

  let groupFormat;
  switch (period) {
    case 'daily':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'weekly':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'yearly':
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    default: // monthly
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }

  const collectionsData = await Collection.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const deliveriesData = await Delivery.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Merge collections and deliveries by date
  const dataMap = {};
  
  collectionsData.forEach(item => {
    if (!dataMap[item._id]) {
      dataMap[item._id] = { date: item._id, collections: 0, deliveries: 0 };
    }
    dataMap[item._id].collections = item.count;
  });

  deliveriesData.forEach(item => {
    if (!dataMap[item._id]) {
      dataMap[item._id] = { date: item._id, collections: 0, deliveries: 0 };
    }
    dataMap[item._id].deliveries = item.count;
  });

  const data = Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    period,
    startDate: start,
    endDate: end,
    data
  });
});

// @desc    Get revenue by vendor
// @route   GET /api/admin/analytics/revenue-by-vendor
// @access  Private (Super Admin)
const getRevenueByVendor = asyncHandler(async (req, res) => {
  const { period = 'monthly', limit = 10, startDate, endDate } = req.query;
  const { start, end } = getDateRange(period, startDate, endDate);

  const revenueData = await Invoice.aggregate([
    {
      $match: {
        status: 'paid',
        paidDate: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$vendorId',
        revenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 }
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  const vendorIds = revenueData.map(item => item._id);
  const vendors = await Vendor.find({ _id: { $in: vendorIds } })
    .select('name businessName');

  const vendorMap = {};
  vendors.forEach(vendor => {
    vendorMap[vendor._id.toString()] = vendor.businessName || vendor.name;
  });

  const data = revenueData.map(item => ({
    vendorId: item._id.toString(),
    vendorName: vendorMap[item._id.toString()] || 'Unknown',
    revenue: item.revenue,
    invoiceCount: item.invoiceCount
  }));

  res.json({
    period,
    startDate: start,
    endDate: end,
    vendors: data
  });
});

module.exports = {
  getAnalyticsOverview,
  getRevenueTrends,
  getVendorsGrowth,
  getUsersGrowth,
  getSubscriptionsStats,
  getTransactionsTrends,
  getRevenueByVendor,
};

