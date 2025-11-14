const Supplier = require('../models/Supplier');
const Collection = require('../models/Collection');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all suppliers for vendor
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ vendorId: req.vendorId }).sort({ name: 1 });
  res.json(suppliers);
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne({
    _id: req.params.id,
    vendorId: req.vendorId,
  });
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  res.json(supplier);
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Vendor, Accountant)
const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create({
    ...req.body,
    vendorId: req.vendorId,
  });
  res.status(201).json(supplier);
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Vendor, Accountant)
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, vendorId: req.vendorId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  res.json(supplier);
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Vendor, Accountant)
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOneAndDelete({
    _id: req.params.id,
    vendorId: req.vendorId,
  });
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  res.json({ message: 'Supplier removed' });
});

// @desc    Get supplier payment history
// @route   GET /api/suppliers/:id/payments
// @access  Private (Vendor, Accountant)
const getSupplierPayments = asyncHandler(async (req, res) => {
  const supplierId = req.params.id;
  
  // Verify supplier belongs to vendor
  const supplier = await Supplier.findOne({
    _id: supplierId,
    vendorId: req.vendorId,
  });
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  // Get payments related to this supplier
  const payments = await Payment.find({
    vendorId: req.vendorId,
    relatedTo: 'supplier',
    relatedId: supplierId,
    type: 'purchase',
  })
    .populate('collectionId', 'quantity purchaseRate totalAmount createdAt')
    .populate('processedBy', 'name email')
    .sort({ paymentDate: -1 });
  
  res.json(payments);
});

// @desc    Get supplier outstanding payments
// @route   GET /api/suppliers/:id/outstanding
// @access  Private (Vendor, Accountant)
const getSupplierOutstanding = asyncHandler(async (req, res) => {
  const supplierId = req.params.id;
  
  // Verify supplier belongs to vendor
  const supplier = await Supplier.findOne({
    _id: supplierId,
    vendorId: req.vendorId,
  });
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  // Get all collections for this supplier
  const collections = await Collection.find({
    vendorId: req.vendorId,
    supplierId: supplierId,
    status: 'completed',
  }).sort({ createdAt: -1 });
  
  // Get all payments made to this supplier
  const payments = await Payment.find({
    vendorId: req.vendorId,
    relatedTo: 'supplier',
    relatedId: supplierId,
    type: 'purchase',
    status: 'completed',
  });
  
  // Calculate totals
  const totalCollections = collections.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = totalCollections - totalPaid;
  
  // Get unpaid collections
  const paidCollectionIds = payments
    .filter(p => p.collectionId)
    .map(p => p.collectionId.toString());
  
  const unpaidCollections = collections.filter(
    c => !paidCollectionIds.includes(c._id.toString())
  );
  
  res.json({
    totalCollections,
    totalPaid,
    outstanding,
    unpaidCollections: unpaidCollections.map(c => ({
      _id: c._id,
      quantity: c.quantity,
      purchaseRate: c.purchaseRate,
      totalAmount: c.totalAmount,
      createdAt: c.createdAt,
    })),
  });
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/:id/stats
// @access  Private (Vendor, Accountant)
const getSupplierStats = asyncHandler(async (req, res) => {
  const supplierId = req.params.id;
  
  // Verify supplier belongs to vendor
  const supplier = await Supplier.findOne({
    _id: supplierId,
    vendorId: req.vendorId,
  });
  
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  // Current month stats
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  const monthlyCollections = await Collection.find({
    vendorId: req.vendorId,
    supplierId: supplierId,
    status: 'completed',
    createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
  });
  
  const monthlyTotal = monthlyCollections.reduce((sum, c) => sum + c.totalAmount, 0);
  const monthlyQuantity = monthlyCollections.reduce((sum, c) => sum + c.quantity, 0);
  
  // Total collections
  const totalCollections = await Collection.countDocuments({
    vendorId: req.vendorId,
    supplierId: supplierId,
    status: 'completed',
  });
  
  res.json({
    monthly: {
      collections: monthlyCollections.length,
      quantity: monthlyQuantity,
      amount: monthlyTotal,
    },
    totalCollections,
  });
});

module.exports = {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPayments,
  getSupplierOutstanding,
  getSupplierStats,
};

