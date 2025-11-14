const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const { type, relatedTo, startDate, endDate } = req.query;
  
  const filter = { vendorId: req.vendorId };
  
  if (type) filter.type = type;
  if (relatedTo) filter.relatedTo = relatedTo;
  if (startDate || endDate) {
    filter.paymentDate = {};
    if (startDate) filter.paymentDate.$gte = new Date(startDate);
    if (endDate) filter.paymentDate.$lte = new Date(endDate);
  }
  
  const payments = await Payment.find(filter)
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('invoiceId', 'invoiceNumber')
    .populate('expenseId', 'category amount')
    .populate('processedBy', 'name email')
    .sort({ paymentDate: -1 });
  
  res.json(payments);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    vendorId: req.vendorId,
  })
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('invoiceId', 'invoiceNumber')
    .populate('expenseId', 'category amount')
    .populate('processedBy', 'name email');
  
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  res.json(payment);
});

// @desc    Create payment (Accountant, Vendor, Society Admin)
// @route   POST /api/payments
// @access  Private (Accountant, Vendor, Society Admin)
const createPayment = asyncHandler(async (req, res) => {
  let vendorId = req.vendorId;
  
  // For society admin, get vendorId from invoice
  if (req.user.role === 'society_admin' && req.body.invoiceId) {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    // Verify invoice belongs to this society
    if (invoice.relatedId.toString() !== req.user.societyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    vendorId = invoice.vendorId;
  }
  
  if (!vendorId) {
    return res.status(400).json({ message: 'Vendor ID is required' });
  }
  
  const payment = await Payment.create({
    ...req.body,
    vendorId: vendorId,
    processedBy: req.user._id,
    status: 'completed',
  });
  
  // Update invoice if payment is linked
  if (payment.invoiceId) {
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.payments.push(payment._id);
      
      // Calculate total paid
      const payments = await Payment.find({
        invoiceId: invoice._id,
        status: 'completed',
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid >= invoice.total) {
        invoice.status = 'paid';
        invoice.paidDate = new Date();
      }
      await invoice.save();
    }
  }
  
  // Update expense if payment is linked
  if (payment.expenseId) {
    await Expense.findByIdAndUpdate(payment.expenseId, {
      status: 'paid',
      paymentId: payment._id,
    });
  }
  
  const populatedPayment = await Payment.findById(payment._id)
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('invoiceId', 'invoiceNumber')
    .populate('expenseId', 'category amount')
    .populate('processedBy', 'name email');
  
  res.status(201).json(populatedPayment);
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private (Accountant, Vendor)
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, vendorId: req.vendorId },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  const populatedPayment = await Payment.findById(payment._id)
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('invoiceId', 'invoiceNumber')
    .populate('expenseId', 'category amount')
    .populate('processedBy', 'name email');
  
  res.json(populatedPayment);
});

module.exports = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
};

