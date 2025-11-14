const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Vendor dashboard statistics
// @route   GET /api/vendor/dashboard/stats
// @access  Private/Vendor
const getVendorDashboardStats = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id; // Handle both vendor user and direct vendor access
  
  // Get vendor
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }

  // Today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Current month date range
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Today's revenue (from completed deliveries)
  const todayRevenueResult = await Payment.aggregate([
    {
      $match: {
        vendorId: vendorId,
        type: 'delivery',
        status: 'completed',
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].totalAmount : 0;

  // Today's deliveries count
  const todayDeliveries = await Delivery.countDocuments({
    vendorId: vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
  });

  // Monthly revenue (current month)
  const monthlyRevenueResult = await Payment.aggregate([
    {
      $match: {
        vendorId: vendorId,
        type: 'delivery',
        status: 'completed',
        createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalAmount : 0;

  // Monthly costs (collections + expenses)
  const monthlyCollectionsResult = await Collection.aggregate([
    {
      $match: {
        vendorId: vendorId,
        createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  const monthlyCollections = monthlyCollectionsResult.length > 0 ? monthlyCollectionsResult[0].totalAmount : 0;

  const monthlyExpensesResult = await Expense.aggregate([
    {
      $match: {
        vendorId: vendorId,
        status: 'approved',
        createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  const monthlyExpenses = monthlyExpensesResult.length > 0 ? monthlyExpensesResult[0].totalAmount : 0;

  const monthlyCosts = monthlyCollections + monthlyExpenses;
  const monthlyProfit = monthlyRevenue - monthlyCosts;

  // Outstanding amounts
  // Outstanding from societies (unpaid invoices)
  const outstandingFromSocietiesResult = await Invoice.aggregate([
    {
      $match: {
        vendorId: vendorId,
        status: { $ne: 'paid' },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  const outstandingFromSocieties = outstandingFromSocietiesResult.length > 0 
    ? outstandingFromSocietiesResult[0].totalAmount : 0;

  // Outstanding to suppliers (unpaid collections)
  const outstandingToSuppliersResult = await Collection.aggregate([
    {
      $match: {
        vendorId: vendorId,
        paymentStatus: { $ne: 'paid' },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  const outstandingToSuppliers = outstandingToSuppliersResult.length > 0 
    ? outstandingToSuppliersResult[0].totalAmount : 0;

  // Active drivers count
  const activeDrivers = await User.countDocuments({
    vendorId: vendorId,
    role: 'driver',
    isActive: true,
  });

  // Active vehicles count
  const activeVehicles = await Vehicle.countDocuments({
    vendorId: vendorId,
    isActive: true,
  });

  // Pending expenses count
  const pendingExpenses = await Expense.countDocuments({
    vendorId: vendorId,
    status: 'pending',
  });

  res.json({
    todayRevenue,
    todayDeliveries,
    monthlyRevenue,
    monthlyCosts,
    monthlyProfit,
    outstandingFromSocieties,
    outstandingToSuppliers,
    activeDrivers,
    activeVehicles,
    pendingExpenses,
  });
});

// @desc    Get Vendor recent activity
// @route   GET /api/vendor/dashboard/recent-activity
// @access  Private/Vendor
const getVendorRecentActivity = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendorId || req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  // Get recent deliveries
  const recentDeliveries = await Delivery.find({ vendorId })
    .populate('societyId', 'name')
    .populate('driverId', 'name')
    .populate('vehicleId', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(limit / 2)
    .select('societyId driverId vehicleId litersDelivered amount createdAt');

  // Get recent collections
  const recentCollections = await Collection.find({ vendorId })
    .populate('supplierId', 'name')
    .populate('driverId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit / 2)
    .select('supplierId driverId litersCollected totalAmount createdAt');

  // Get recent expenses
  const recentExpenses = await Expense.find({ vendorId })
    .populate('driverId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit / 3)
    .select('driverId category amount status createdAt');

  const activities = [];

  recentDeliveries.forEach(delivery => {
    activities.push({
      id: delivery._id,
      type: 'delivery',
      action: 'Delivery completed',
      description: `${delivery.litersDelivered}L delivered to ${delivery.societyId?.name || 'N/A'}`,
      driver: delivery.driverId?.name || 'N/A',
      vehicle: delivery.vehicleId?.vehicleNumber || 'N/A',
      amount: delivery.amount,
      time: delivery.createdAt,
      icon: '🚚',
    });
  });

  recentCollections.forEach(collection => {
    activities.push({
      id: collection._id,
      type: 'collection',
      action: 'Water collected',
      description: `${collection.litersCollected}L collected from ${collection.supplierId?.name || 'N/A'}`,
      driver: collection.driverId?.name || 'N/A',
      amount: collection.totalAmount,
      time: collection.createdAt,
      icon: '💧',
    });
  });

  recentExpenses.forEach(expense => {
    activities.push({
      id: expense._id,
      type: 'expense',
      action: expense.status === 'approved' ? 'Expense approved' : 'Expense submitted',
      description: `${expense.category} expense - ₹${expense.amount}`,
      driver: expense.driverId?.name || 'N/A',
      amount: expense.amount,
      status: expense.status,
      time: expense.createdAt,
      icon: '💰',
    });
  });

  // Sort by time and limit
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json(activities.slice(0, limit));
});

module.exports = {
  getVendorDashboardStats,
  getVendorRecentActivity,
};

