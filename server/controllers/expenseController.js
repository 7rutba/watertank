const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const { status, driverId, category, startDate, endDate } = req.query;
  
  const filter = { vendorId: req.vendorId };
  
  // Drivers can only see their own expenses
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  } else if (driverId) {
    filter.driverId = driverId;
  }
  
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
  }
  
  const expenses = await Expense.find(filter)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });
  
  res.json(expenses);
});

// @desc    Admin: Get all expenses (optionally filter by vendorId/driverId)
// @route   GET /api/admin/expenses
// @access  Private (Super Admin)
const getAllExpensesAdmin = asyncHandler(async (req, res) => {
  const { status, driverId, vendorId, category, startDate, endDate } = req.query;
  const filter = {};
  if (vendorId) filter.vendorId = vendorId;
  if (driverId) filter.driverId = driverId;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate);
    if (endDate) filter.expenseDate.$lte = new Date(endDate);
  }

  const expenses = await Expense.find(filter)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(expenses);
});

// @desc    Admin: Get single expense
// @route   GET /api/admin/expenses/:id
// @access  Private (Super Admin)
const getExpenseAdmin = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('approvedBy', 'name email');
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  res.json(expense);
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, vendorId: req.vendorId };
  
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  }
  
  const expense = await Expense.findOne(filter)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('approvedBy', 'name email');
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  res.json(expense);
});

// @desc    Create expense (Driver)
// @route   POST /api/expenses
// @access  Private (Driver)
const createExpense = asyncHandler(async (req, res) => {
  const { collectionId, deliveryId, category, amount, description, expenseDate } = req.body;
  
  const expense = await Expense.create({
    vendorId: req.vendorId,
    driverId: req.user._id,
    collectionId: collectionId || null,
    deliveryId: deliveryId || null,
    category,
    amount,
    description,
    receipt: req.file ? req.file.path : null,
    expenseDate: expenseDate || new Date(),
    status: 'pending',
  });
  
  const populatedExpense = await Expense.findById(expense._id)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity');
  
  res.status(201).json(populatedExpense);
});

// @desc    Approve/Reject expense (Vendor/Accountant)
// @route   PUT /api/expenses/:id/approve
// @access  Private (Vendor, Accountant)
const approveExpense = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "approved" or "rejected"' });
  }
  
  const expense = await Expense.findOne({
    _id: req.params.id,
    vendorId: req.vendorId,
  });
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  expense.status = status;
  expense.approvedBy = req.user._id;
  expense.approvedAt = new Date();
  if (status === 'rejected' && rejectionReason) {
    expense.rejectionReason = rejectionReason;
  }
  
  await expense.save();
  
  const populatedExpense = await Expense.findById(expense._id)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity')
    .populate('approvedBy', 'name email');
  
  res.json(populatedExpense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const filter = { 
    _id: req.params.id, 
    vendorId: req.vendorId,
  };
  
  // Drivers can only update their own pending expenses
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
    filter.status = 'pending';
  }
  
  const updateData = { ...req.body };
  if (req.file) updateData.receipt = req.file.path;
  
  const expense = await Expense.findOneAndUpdate(
    filter,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found or cannot be updated' });
  }
  
  const populatedExpense = await Expense.findById(expense._id)
    .populate('driverId', 'name email phone')
    .populate('collectionId', 'supplierId quantity')
    .populate('deliveryId', 'societyId quantity');
  
  res.json(populatedExpense);
});

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  approveExpense,
  updateExpense,
  getAllExpensesAdmin,
  getExpenseAdmin,
  // Admin-only assignment controller is exported for admin routes
  assignExpenseCharge: asyncHandler(async (req, res) => {
    const { chargedTo } = req.body;
    if (!['vendor', 'driver'].includes(chargedTo)) {
      return res.status(400).json({ message: 'Invalid chargedTo. Use "vendor" or "driver"' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return rap.status(404).json({ message: 'Expense not found' });
    }

    // Enforce policy: fuel expenses should always be vendor-charged
    if (expense.category === 'fuel' && chargedTo !== 'vendor') {
      return res.status(400).json({ message: 'Fuel expenses must be charged to vendor' });
    }

    expense.chargedTo = chargedTo;
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('driverId', 'name email phone')
      .populate('collectionId', 'supplierId quantity')
      .populate('deliveryId', 'societyId quantity')
      .populate('approvedBy', 'name email');

    res.json(populatedExpense);
  }),
};

