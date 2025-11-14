const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all drivers for a vendor
// @route   GET /api/drivers
// @access  Private/Vendor
const getDrivers = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  
  const drivers = await User.find({
    vendorId: vendorId,
    role: 'driver',
  })
    .select('-password')
    .sort({ createdAt: -1 });
  
  res.json(drivers);
});

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private/Vendor
const getDriver = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  
  const driver = await User.findOne({
    _id: req.params.id,
    vendorId: vendorId,
    role: 'driver',
  }).select('-password');
  
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  
  // Get driver statistics
  const vehicle = await Vehicle.findOne({ driverId: driver._id });
  const deliveriesCount = await Delivery.countDocuments({ driverId: driver._id });
  const collectionsCount = await Collection.countDocuments({ driverId: driver._id });
  const pendingExpenses = await Expense.countDocuments({ driverId: driver._id, status: 'pending' });
  
  res.json({
    ...driver.toObject(),
    stats: {
      vehicle: vehicle ? {
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
      } : null,
      deliveriesCount,
      collectionsCount,
      pendingExpenses,
    },
  });
});

// @desc    Create driver
// @route   POST /api/drivers
// @access  Private/Vendor
const createDriver = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  const { name, email, password, phone } = req.body;
  
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  // Create driver
  const driver = await User.create({
    name,
    email,
    password: password || 'driver123', // Default password
    role: 'driver',
    phone,
    vendorId: vendorId,
    isActive: true,
  });
  
  const driverResponse = driver.toObject();
  delete driverResponse.password;
  
  res.status(201).json(driverResponse);
});

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private/Vendor
const updateDriver = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  
  const driver = await User.findOne({
    _id: req.params.id,
    vendorId: vendorId,
    role: 'driver',
  });
  
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  
  // Update fields
  const { name, email, phone, isActive } = req.body;
  
  if (name) driver.name = name;
  if (email) {
    // Check if email is already taken by another user
    const emailExists = await User.findOne({ email, _id: { $ne: driver._id } });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    driver.email = email;
  }
  if (phone !== undefined) driver.phone = phone;
  if (isActive !== undefined) driver.isActive = isActive;
  
  await driver.save();
  
  const driverResponse = driver.toObject();
  delete driverResponse.password;
  
  res.json(driverResponse);
});

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private/Vendor
const deleteDriver = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  
  const driver = await User.findOne({
    _id: req.params.id,
    vendorId: vendorId,
    role: 'driver',
  });
  
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  
  // Check if driver is assigned to any vehicle
  const vehicle = await Vehicle.findOne({ driverId: driver._id });
  if (vehicle) {
    return res.status(400).json({ 
      message: 'Cannot delete driver. Driver is assigned to a vehicle. Please unassign first.' 
    });
  }
  
  // Check if driver has pending deliveries or collections
  const pendingDeliveries = await Delivery.countDocuments({ 
    driverId: driver._id, 
    status: 'pending' 
  });
  const pendingCollections = await Collection.countDocuments({ 
    driverId: driver._id, 
    status: 'pending' 
  });
  
  if (pendingDeliveries > 0 || pendingCollections > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete driver. Driver has pending deliveries or collections.' 
    });
  }
  
  await driver.deleteOne();
  res.json({ message: 'Driver removed successfully' });
});

// @desc    Get driver performance stats
// @route   GET /api/drivers/:id/stats
// @access  Private/Vendor
const getDriverStats = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  
  const driver = await User.findOne({
    _id: req.params.id,
    vendorId: vendorId,
    role: 'driver',
  });
  
  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  
  // Get date ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  // Today's stats
  const todayDeliveries = await Delivery.countDocuments({
    driverId: driver._id,
    createdAt: { $gte: today, $lt: tomorrow },
  });
  
  const todayRevenueResult = await Delivery.aggregate([
    {
      $match: {
        driverId: driver._id,
        createdAt: { $gte: today, $lt: tomorrow },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].totalAmount : 0;
  
  // Monthly stats
  const monthlyDeliveries = await Delivery.countDocuments({
    driverId: driver._id,
    createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
  });
  
  const monthlyRevenueResult = await Delivery.aggregate([
    {
      $match: {
        driverId: driver._id,
        createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
  const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalAmount : 0;
  
  // Total stats
  const totalDeliveries = await Delivery.countDocuments({ driverId: driver._id });
  const totalCollections = await Collection.countDocuments({ driverId: driver._id });
  const totalExpenses = await Expense.countDocuments({ driverId: driver._id });
  
  res.json({
    today: {
      deliveries: todayDeliveries,
      revenue: todayRevenue,
    },
    monthly: {
      deliveries: monthlyDeliveries,
      revenue: monthlyRevenue,
    },
    total: {
      deliveries: totalDeliveries,
      collections: totalCollections,
      expenses: totalExpenses,
    },
  });
});

module.exports = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats,
};

