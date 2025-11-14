const Society = require('../models/Society');
const Delivery = require('../models/Delivery');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all societies
// @route   GET /api/societies
// @access  Private
const getSocieties = asyncHandler(async (req, res) => {
  const filter = {};
  
  if (req.vendorId) {
    filter.vendorId = req.vendorId;
  }
  if (req.societyId) {
    filter._id = req.societyId;
  }
  
  const societies = await Society.find(filter).sort({ name: 1 });
  res.json(societies);
});

// @desc    Get single society
// @route   GET /api/societies/:id
// @access  Private
const getSociety = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter._id = req.societyId;
  
  const society = await Society.findOne(filter);
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  res.json(society);
});

// @desc    Create society
// @route   POST /api/societies
// @access  Private (Vendor, Accountant)
const createSociety = asyncHandler(async (req, res) => {
  const society = await Society.create({
    ...req.body,
    vendorId: req.vendorId,
  });
  res.status(201).json(society);
});

// @desc    Update society
// @route   PUT /api/societies/:id
// @access  Private
const updateSociety = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter._id = req.societyId;
  
  const society = await Society.findOneAndUpdate(
    filter,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  res.json(society);
});

// @desc    Delete society
// @route   DELETE /api/societies/:id
// @access  Private (Vendor, Accountant)
const deleteSociety = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  
  const society = await Society.findOneAndDelete(filter);
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  res.json({ message: 'Society removed' });
});

// @desc    Get society delivery history
// @route   GET /api/societies/:id/deliveries
// @access  Private (Vendor, Accountant)
const getSocietyDeliveries = asyncHandler(async (req, res) => {
  const societyId = req.params.id;
  
  // Verify society belongs to vendor
  const society = await Society.findOne({
    _id: societyId,
    vendorId: req.vendorId,
  });
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  const { startDate, endDate, status } = req.query;
  const filter = {
    vendorId: req.vendorId,
    societyId: societyId,
  };
  
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const deliveries = await Delivery.find(filter)
    .populate('vehicleId', 'vehicleNumber vehicleType')
    .populate('driverId', 'name email phone')
    .populate('invoiceId', 'invoiceNumber status')
    .sort({ createdAt: -1 });
  
  res.json(deliveries);
});

// @desc    Get society outstanding invoices
// @route   GET /api/societies/:id/outstanding
// @access  Private (Vendor, Accountant)
const getSocietyOutstanding = asyncHandler(async (req, res) => {
  const societyId = req.params.id;
  
  // Verify society belongs to vendor
  const society = await Society.findOne({
    _id: societyId,
    vendorId: req.vendorId,
  });
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  // Get all invoices for this society
  const invoices = await Invoice.find({
    vendorId: req.vendorId,
    relatedTo: 'society',
    relatedId: societyId,
    status: { $in: ['sent', 'overdue'] },
  }).sort({ createdAt: -1 });
  
  // Calculate outstanding for each invoice
  const outstandingInvoices = await Promise.all(invoices.map(async (invoice) => {
    const payments = await Payment.find({
      invoiceId: invoice._id,
      status: 'completed',
    });
    
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingAmount = invoice.total - paidAmount;
    
    return {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      paid: paidAmount,
      outstanding: outstandingAmount,
      dueDate: invoice.dueDate,
      status: invoice.status,
      createdAt: invoice.createdAt,
      period: invoice.period,
    };
  }));
  
  // Calculate totals
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding, 0);
  const totalInvoiced = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = outstandingInvoices.reduce((sum, inv) => sum + inv.paid, 0);
  
  // Get unbilled deliveries
  const unbilledDeliveries = await Delivery.find({
    vendorId: req.vendorId,
    societyId: societyId,
    status: 'completed',
    isInvoiced: false,
  })
    .populate('vehicleId', 'vehicleNumber')
    .populate('driverId', 'name')
    .sort({ createdAt: -1 });
  
  const unbilledAmount = unbilledDeliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  
  res.json({
    outstandingInvoices,
    totalOutstanding,
    totalInvoiced,
    totalPaid,
    unbilledDeliveries: unbilledDeliveries.map(d => ({
      _id: d._id,
      quantity: d.quantity,
      deliveryRate: d.deliveryRate,
      totalAmount: d.totalAmount,
      createdAt: d.createdAt,
      vehicleNumber: d.vehicleId?.vehicleNumber,
      driverName: d.driverId?.name,
    })),
    unbilledAmount,
  });
});

// @desc    Get society statistics
// @route   GET /api/societies/:id/stats
// @access  Private (Vendor, Accountant)
const getSocietyStats = asyncHandler(async (req, res) => {
  const societyId = req.params.id;
  
  // Verify society belongs to vendor
  const society = await Society.findOne({
    _id: societyId,
    vendorId: req.vendorId,
  });
  
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  // Current month stats
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  const monthlyDeliveries = await Delivery.find({
    vendorId: req.vendorId,
    societyId: societyId,
    status: 'completed',
    createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
  });
  
  const monthlyTotal = monthlyDeliveries.reduce((sum, d) => sum + d.totalAmount, 0);
  const monthlyQuantity = monthlyDeliveries.reduce((sum, d) => sum + d.quantity, 0);
  
  // Total deliveries
  const totalDeliveries = await Delivery.countDocuments({
    vendorId: req.vendorId,
    societyId: societyId,
    status: 'completed',
  });
  
  // Total quantity delivered
  const allDeliveries = await Delivery.find({
    vendorId: req.vendorId,
    societyId: societyId,
    status: 'completed',
  });
  const totalQuantity = allDeliveries.reduce((sum, d) => sum + d.quantity, 0);
  
  res.json({
    monthly: {
      deliveries: monthlyDeliveries.length,
      quantity: monthlyQuantity,
      amount: monthlyTotal,
    },
    total: {
      deliveries: totalDeliveries,
      quantity: totalQuantity,
    },
  });
});

module.exports = {
  getSocieties,
  getSociety,
  createSociety,
  updateSociety,
  deleteSociety,
  getSocietyDeliveries,
  getSocietyOutstanding,
  getSocietyStats,
};

