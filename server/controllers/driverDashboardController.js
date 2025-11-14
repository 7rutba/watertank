const Collection = require('../models/Collection');
const Delivery = require('../models/Delivery');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get driver dashboard stats
// @route   GET /api/driver/dashboard/stats
// @access  Private (Driver)
const getDriverDashboardStats = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const vendorId = req.user.vendorId;
  
  if (!vendorId) {
    return res.status(400).json({ message: 'Driver must be associated with a vendor' });
  }
  
  // Today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Today's collections count
  const todayCollections = await Collection.countDocuments({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
  });
  
  // Today's deliveries count
  const todayDeliveries = await Delivery.countDocuments({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
  });
  
  // Today's revenue (from completed deliveries)
  const todayDeliveriesData = await Delivery.find({
    driverId,
    vendorId,
    createdAt: { $gte: today, $lt: tomorrow },
    status: 'completed',
  });
  const todayRevenue = todayDeliveriesData.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  
  // Pending expenses count
  const pendingExpenses = await Expense.countDocuments({
    driverId,
    vendorId,
    status: 'pending',
  });
  
  res.json({
    todayCollections,
    todayDeliveries,
    todayRevenue,
    pendingExpenses,
  });
});

// @desc    Get driver recent trips
// @route   GET /api/driver/dashboard/recent-trips
// @access  Private (Driver)
const getDriverRecentTrips = asyncHandler(async (req, res) => {
  const driverId = req.user._id;
  const vendorId = req.user.vendorId;
  const limit = parseInt(req.query.limit) || 10;
  
  if (!vendorId) {
    return res.status(400).json({ message: 'Driver must be associated with a vendor' });
  }
  
  // Get recent collections
  const collections = await Collection.find({ driverId, vendorId })
    .populate('supplierId', 'name')
    .populate('vehicleId', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('supplierId vehicleId quantity totalAmount location createdAt status');
  
  // Get recent deliveries
  const deliveries = await Delivery.find({ driverId, vendorId })
    .populate('societyId', 'name')
    .populate('vehicleId', 'vehicleNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('societyId vehicleId quantity totalAmount location createdAt status');
  
  // Combine and format
  const trips = [];
  
  collections.forEach(c => {
    trips.push({
      id: c._id,
      type: 'collection',
      date: c.createdAt,
      location: c.location,
      quantity: c.quantity,
      amount: c.totalAmount,
      status: c.status,
      supplier: c.supplierId?.name,
      vehicle: c.vehicleId?.vehicleNumber,
    });
  });
  
  deliveries.forEach(d => {
    trips.push({
      id: d._id,
      type: 'delivery',
      date: d.createdAt,
      location: d.location,
      quantity: d.quantity,
      amount: d.totalAmount,
      status: d.status,
      society: d.societyId?.name,
      vehicle: d.vehicleId?.vehicleNumber,
    });
  });
  
  // Sort by date and limit
  trips.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(trips.slice(0, limit));
});

module.exports = {
  getDriverDashboardStats,
  getDriverRecentTrips,
};

