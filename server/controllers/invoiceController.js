const Invoice = require('../models/Invoice');
const Delivery = require('../models/Delivery');
const Collection = require('../models/Collection');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const { type, relatedTo, status, startDate, endDate } = req.query;
  
  const filter = {};
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter.relatedId = req.societyId;
  
  if (type) filter.type = type;
  if (relatedTo) filter.relatedTo = relatedTo;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const invoices = await Invoice.find(filter)
    .populate('relatedId')
    .populate('items.deliveryId', 'quantity deliveryRate')
    .populate('items.collectionId', 'quantity purchaseRate')
    .populate('payments')
    .sort({ createdAt: -1 });
  
  res.json(invoices);
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter.relatedId = req.societyId;
  
  const invoice = await Invoice.findOne(filter)
    .populate('relatedId')
    .populate('items.deliveryId')
    .populate('items.collectionId')
    .populate('payments');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  res.json(invoice);
});

// @desc    Generate invoice for custom date range
// @route   POST /api/invoices/generate-monthly
// @access  Private (Vendor, Accountant)
const generateMonthlyInvoice = asyncHandler(async (req, res) => {
  const { relatedId, relatedTo, startDate, endDate } = req.body;
  
  // Validate required fields
  if (!relatedId || !relatedTo || !startDate || !endDate) {
    return res.status(400).json({ 
      message: 'Missing required fields: relatedId, relatedTo, startDate, endDate' 
    });
  }
  
  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }
  
  if (start > end) {
    return res.status(400).json({ message: 'Start date must be before end date' });
  }
  
  if (relatedTo === 'society') {
    // Generate invoice for society deliveries
    const deliveries = await Delivery.find({
      vendorId: req.vendorId,
      societyId: relatedId,
      status: 'completed',
      isInvoiced: false,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('driverId', 'name')
      .populate('vehicleId', 'vehicleNumber');
    
    if (deliveries.length === 0) {
      return res.status(400).json({ message: 'No unbilled deliveries found for the selected period' });
    }
    
    const items = deliveries.map(delivery => ({
      deliveryId: delivery._id,
      date: delivery.createdAt,
      driverName: delivery.driverId.name,
      vehicleNumber: delivery.vehicleId.vehicleNumber,
      quantity: delivery.quantity,
      rate: delivery.deliveryRate,
      amount: delivery.totalAmount,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal; // Add tax/discount logic here if needed
    
    // Generate invoice number before creating
    let invoiceNumber;
    try {
      const prefix = 'MON';
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const startOfMonth = new Date(year, new Date().getMonth(), 1);
      const endOfMonth = new Date(year, new Date().getMonth() + 1, 1);
      
      const count = await Invoice.countDocuments({ 
        vendorId: req.vendorId,
        type: 'monthly',
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        }
      });
      
      invoiceNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback: use timestamp-based invoice number
      const timestamp = Date.now().toString().slice(-8);
      invoiceNumber = `MON-${timestamp}`;
    }
    
    const invoice = await Invoice.create({
      vendorId: req.vendorId,
      invoiceNumber,
      type: 'monthly',
      relatedTo: 'society',
      relatedId,
      period: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      items,
      subtotal,
      total,
      status: 'draft',
      dueDate: new Date(endDate),
    });
    
    // Mark deliveries as invoiced
    await Delivery.updateMany(
      { _id: { $in: deliveries.map(d => d._id) } },
      { isInvoiced: true, invoiceId: invoice._id }
    );
    
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('relatedId')
      .populate('items.deliveryId');
    
    res.status(201).json(populatedInvoice);
  } else if (relatedTo === 'supplier') {
    // Generate invoice for supplier collections
    const collections = await Collection.find({
      vendorId: req.vendorId,
      supplierId: relatedId,
      status: 'completed',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('driverId', 'name')
      .populate('vehicleId', 'vehicleNumber');
    
    if (collections.length === 0) {
      return res.status(400).json({ message: 'No collections found for the selected period' });
    }
    
    const items = collections.map(collection => ({
      collectionId: collection._id,
      date: collection.createdAt,
      driverName: collection.driverId.name,
      vehicleNumber: collection.vehicleId.vehicleNumber,
      quantity: collection.quantity,
      rate: collection.purchaseRate,
      amount: collection.totalAmount,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal;
    
    // Generate invoice number before creating
    let invoiceNumber;
    try {
      const prefix = 'MON';
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const startOfMonth = new Date(year, new Date().getMonth(), 1);
      const endOfMonth = new Date(year, new Date().getMonth() + 1, 1);
      
      const count = await Invoice.countDocuments({ 
        vendorId: req.vendorId,
        type: 'monthly',
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        }
      });
      
      invoiceNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback: use timestamp-based invoice number
      const timestamp = Date.now().toString().slice(-8);
      invoiceNumber = `MON-${timestamp}`;
    }
    
    const invoice = await Invoice.create({
      vendorId: req.vendorId,
      invoiceNumber,
      type: 'monthly',
      relatedTo: 'supplier',
      relatedId,
      period: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      items,
      subtotal,
      total,
      status: 'draft',
      dueDate: new Date(endDate),
    });
    
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('relatedId')
      .populate('items.collectionId');
    
    res.status(201).json(populatedInvoice);
  } else {
    return res.status(400).json({ message: 'Invalid relatedTo. Use "society" or "supplier"' });
  }
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter.relatedId = req.societyId;
  
  const invoice = await Invoice.findOneAndUpdate(
    filter,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('relatedId')
    .populate('items.deliveryId')
    .populate('items.collectionId')
    .populate('payments');
  
  res.json(populatedInvoice);
});

// @desc    Send invoice
// @route   PUT /api/invoices/:id/send
// @access  Private (Vendor, Accountant)
const sendInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    vendorId: req.vendorId,
  });
  
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  invoice.status = 'sent';
  await invoice.save();
  
  // TODO: Send email/SMS/WhatsApp notification here
  
  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('relatedId')
    .populate('items.deliveryId')
    .populate('items.collectionId');
  
  res.json(populatedInvoice);
});

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter.relatedId = req.societyId;
  
  const invoice = await Invoice.findOne(filter)
    .populate('relatedId')
    .populate('items.deliveryId')
    .populate('items.collectionId')
    .populate('payments');
  
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  // Get vendor information
  const vendor = await Vendor.findById(invoice.vendorId);
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  try {
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice, vendor);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`
    );
    
    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
});

module.exports = {
  getInvoices,
  getInvoice,
  generateMonthlyInvoice,
  updateInvoice,
  sendInvoice,
  downloadInvoicePDF,
};

