const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Expense = require('../models/Expense');
const DriverAttendance = require('../models/DriverAttendance');
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
  const { name, email, password, phone, dailyWage } = req.body;
  
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
    dailyWage: Number(dailyWage) || 0,
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
  const { name, email, phone, isActive, dailyWage } = req.body;
  
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
  if (dailyWage !== undefined) driver.dailyWage = Number(dailyWage) || 0;
  
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
  // Vendor marks attendance for a driver for a given date
  markAttendance: asyncHandler(async (req, res) => {
    const vendorId = req.vendorId || req.user.vendorId;
    const driverId = req.params.id;
    const { date, status, note } = req.body;

    if (!['present', 'absent', 'half'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use present/absent/half' });
    }
    if (!date) {
      return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });
    }

    const d = new Date(date + 'T00:00:00.000Z');
    const upsert = await DriverAttendance.findOneAndUpdate(
      { vendorId, driverId, date: d },
      { vendorId, driverId, date: d, status, note: note || '', markedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(upsert);
  }),
  // Get attendance list and summary for a month
  getAttendance: asyncHandler(async (req, res) => {
    const vendorId = req.vendorId || req.user.vendorId;
    const driverId = req.params.id;
    const { month } = req.query; // format: YYYY-MM
    if (!month) {
      return res.status(400).json({ message: 'month is required (YYYY-MM)' });
    }
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 1));

    const records = await DriverAttendance.find({
      vendorId, driverId, date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    const summary = records.reduce((acc, r) => {
      if (r.status === 'present') acc.present += 1;
      else if (r.status === 'half') acc.half += 1;
      else acc.absent += 1;
      return acc;
    }, { present: 0, half: 0, absent: 0 });

    res.json({ records, summary });
  }),
  // Calculate salary for a month based on attendance and expenses charged to driver (excluding fuel)
  getSalary: asyncHandler(async (req, res) => {
    const vendorId = req.vendorId || req.user.vendorId;
    const driverId = req.params.id;
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ message: 'month is required (YYYY-MM)' });
    }
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 1));

    const driver = await User.findOne({ _id: driverId, vendorId, role: 'driver' }).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    const dailyWage = Number(driver.dailyWage || 0);

    const attendance = await DriverAttendance.find({ vendorId, driverId, date: { $gte: start, $lt: end } });
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const halfDays = attendance.filter(a => a.status === 'half').length;
    const attendanceUnits = presentDays + halfDays * 0.5;

    const grossPay = attendanceUnits * dailyWage;

    const expenses = await Expense.aggregate([
      {
        $match: {
          vendorId,
          driverId: new mongoose.Types.ObjectId(driverId),
          status: 'approved',
          chargedTo: 'driver',
          expenseDate: { $gte: start, $lt: end },
          category: { $ne: 'fuel' },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const driverExpenses = expenses.length ? expenses[0].total : 0;

    const netPay = Math.max(0, grossPay - driverExpenses);

    res.json({
      driver: {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        dailyWage,
      },
      month,
      attendance: {
        presentDays,
        halfDays,
        attendanceUnits,
      },
      grossPay,
      driverExpenses,
      netPay,
    });
  }),
};

