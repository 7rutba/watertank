const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Profit & Loss report
// @route   GET /api/reports/profit-loss
// @access  Private (Vendor, Accountant)
const getProfitLoss = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const filter = {
    vendorId: req.vendorId,
    status: 'completed',
  };
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  // Get deliveries (revenue)
  const deliveries = await Delivery.find(filter);
  const totalRevenue = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  
  // Get collections (purchase cost)
  const collections = await Collection.find(filter);
  const totalPurchaseCost = collections.reduce((sum, c) => sum + c.totalAmount, 0);
  
  // Get expenses
  const expenseFilter = { vendorId: req.vendorId, status: 'approved' };
  if (startDate || endDate) {
    expenseFilter.expenseDate = {};
    if (startDate) expenseFilter.expenseDate.$gte = new Date(startDate);
    if (endDate) expenseFilter.expenseDate.$lte = new Date(endDate);
  }
  
  const expenses = await Expense.find(expenseFilter);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const grossProfit = totalRevenue - totalPurchaseCost;
  const netProfit = grossProfit - totalExpenses;
  
  res.json({
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    revenue: {
      total: totalRevenue,
      deliveries: deliveries.length,
      averagePerDelivery: deliveries.length > 0 ? totalRevenue / deliveries.length : 0,
    },
    costs: {
      purchase: totalPurchaseCost,
      expenses: totalExpenses,
      total: totalPurchaseCost + totalExpenses,
    },
    profit: {
      gross: grossProfit,
      net: netProfit,
      margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
    },
  });
});

// @desc    Get Outstanding report
// @route   GET /api/reports/outstanding
// @access  Private (Vendor, Accountant)
const getOutstanding = asyncHandler(async (req, res) => {
  const { type } = req.query; // 'supplier' or 'society'
  
  const invoices = await Invoice.find({
    vendorId: req.vendorId,
    relatedTo: type || { $in: ['supplier', 'society'] },
    status: { $in: ['sent', 'overdue'] },
  }).populate('relatedId');
  
  const outstanding = await Promise.all(invoices.map(async (invoice) => {
    const payments = await Payment.find({
      invoiceId: invoice._id,
      status: 'completed',
    });
    
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingAmount = invoice.total - paidAmount;
    
    return {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      relatedTo: invoice.relatedTo,
      relatedId: invoice.relatedId,
      total: invoice.total,
      paid: paidAmount,
      outstanding: outstandingAmount,
      dueDate: invoice.dueDate,
      status: invoice.status,
    };
  }));
  
  const totalOutstanding = outstanding.reduce((sum, item) => sum + item.outstanding, 0);
  
  res.json({
    type: type || 'all',
    invoices: outstanding,
    totalOutstanding,
    count: outstanding.length,
  });
});

// @desc    Get Monthly report
// @route   GET /api/reports/monthly
// @access  Private (Vendor, Accountant)
const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const reportMonth = month || new Date().getMonth() + 1;
  const reportYear = year || new Date().getFullYear();
  const startDate = new Date(reportYear, reportMonth - 1, 1);
  const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
  
  const filter = {
    vendorId: req.vendorId,
    status: 'completed',
    createdAt: { $gte: startDate, $lte: endDate },
  };
  
  const deliveries = await Delivery.find(filter);
  const collections = await Collection.find(filter);
  
  const payments = await Payment.find({
    vendorId: req.vendorId,
    status: 'completed',
    paymentDate: { $gte: startDate, $lte: endDate },
  });
  
  const expenses = await Expense.find({
    vendorId: req.vendorId,
    status: 'approved',
    expenseDate: { $gte: startDate, $lte: endDate },
  });
  
  const totalRevenue = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPurchase = collections.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPayments = payments.reduce((sum, pay) => sum + pay.amount, 0);
  
  res.json({
    period: {
      month: reportMonth,
      year: reportYear,
      startDate,
      endDate,
    },
    deliveries: {
      total: deliveries.length,
      completed: deliveries.filter(d => d.status === 'completed').length,
    },
    collections: {
      total: collections.length,
      completed: collections.filter(c => c.status === 'completed').length,
    },
    financial: {
      revenue: totalRevenue,
      purchase: totalPurchase,
      expenses: totalExpenses,
      payments: totalPayments,
      profit: totalRevenue - totalPurchase - totalExpenses,
    },
  });
});

module.exports = {
  getProfitLoss,
  getOutstanding,
  getMonthlyReport,
};

