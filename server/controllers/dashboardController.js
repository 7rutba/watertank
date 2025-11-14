const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get vendor dashboard data
// @route   GET /api/dashboard
// @access  Private (Vendor, Accountant)
const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Today's deliveries
  const todayDeliveries = await Delivery.find({
    vendorId: req.vendorId,
    status: 'completed',
    createdAt: { $gte: today, $lt: tomorrow },
  });
  const todayRevenue = todayDeliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  
  // Current month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  
  const monthDeliveries = await Delivery.find({
    vendorId: req.vendorId,
    status: 'completed',
    createdAt: { $gte: monthStart, $lte: monthEnd },
  });
  const monthRevenue = monthDeliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  
  const monthCollections = await Collection.find({
    vendorId: req.vendorId,
    status: 'completed',
    createdAt: { $gte: monthStart, $lte: monthEnd },
  });
  const monthPurchase = monthCollections.reduce((sum, c) => sum + c.totalAmount, 0);
  
  const monthExpenses = await Expense.find({
    vendorId: req.vendorId,
    status: 'approved',
    expenseDate: { $gte: monthStart, $lte: monthEnd },
  });
  const monthExpenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Outstanding invoices
  const outstandingInvoices = await Invoice.find({
    vendorId: req.vendorId,
    status: { $in: ['sent', 'overdue'] },
  });
  
  // Active vehicles
  const activeVehicles = await Vehicle.countDocuments({
    vendorId: req.vendorId,
    isActive: true,
  });
  
  // Pending expenses
  const pendingExpenses = await Expense.countDocuments({
    vendorId: req.vendorId,
    status: 'pending',
  });
  
  res.json({
    today: {
      deliveries: todayDeliveries.length,
      revenue: todayRevenue,
    },
    monthly: {
      revenue: monthRevenue,
      purchase: monthPurchase,
      expenses: monthExpenseTotal,
      profit: monthRevenue - monthPurchase - monthExpenseTotal,
    },
    outstanding: {
      invoices: outstandingInvoices.length,
      amount: outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0),
    },
    activeVehicles,
    pendingExpenses,
  });
});

module.exports = {
  getDashboard,
};

