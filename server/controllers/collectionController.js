const Collection = require('../models/Collection');
const Supplier = require('../models/Supplier');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all collections for vendor
// @route   GET /api/collections
// @access  Private (Driver, Vendor, Accountant)
const getCollections = asyncHandler(async (req, res) => {
  const { status, driverId, supplierId, startDate, endDate } = req.query;
  
  const filter = { vendorId: req.vendorId };
  
  // Drivers can only see their own collections
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  } else if (driverId) {
    filter.driverId = driverId;
  }
  
  if (status) filter.status = status;
  if (supplierId) filter.supplierId = supplierId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const collections = await Collection.find(filter)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('supplierId', 'name purchaseRate')
    .sort({ createdAt: -1 });
  
  res.json(collections);
});

// @desc    Get single collection
// @route   GET /api/collections/:id
// @access  Private
const getCollection = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, vendorId: req.vendorId };
  
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  }
  
  const collection = await Collection.findOne(filter)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('supplierId', 'name purchaseRate address');
  
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }
  
  res.json(collection);
});

// @desc    Create collection (Driver)
// @route   POST /api/collections
// @access  Private (Driver)
const createCollection = asyncHandler(async (req, res) => {
  let { vehicleId, supplierId, quantity, purchaseRate, location, notes } = req.body;
  
  // Parse location if it's a JSON string (from FormData)
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }
  
  // Get supplier to get purchase rate if not provided
  const supplier = await Supplier.findOne({ _id: supplierId, vendorId: req.vendorId });
  if (!supplier) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  
  // Verify vehicle belongs to vendor
  const vehicle = await Vehicle.findOne({ _id: vehicleId, vendorId: req.vendorId });
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  const collection = await Collection.create({
    vendorId: req.vendorId,
    vehicleId,
    driverId: req.user._id,
    supplierId,
    quantity,
    purchaseRate: purchaseRate || supplier.purchaseRate,
    location,
    meterPhoto: req.file ? req.file.path : null,
    notes,
    status: 'completed',
  });
  
  const populatedCollection = await Collection.findById(collection._id)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('supplierId', 'name purchaseRate');
  
  res.status(201).json(populatedCollection);
});

// @desc    Update collection
// @route   PUT /api/collections/:id
// @access  Private (Driver can only update pending)
const updateCollection = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id, vendorId: req.vendorId };
  
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
    filter.status = 'pending'; // Drivers can only update pending collections
  }
  
  const collection = await Collection.findOneAndUpdate(
    filter,
    {
      ...req.body,
      meterPhoto: req.file ? req.file.path : req.body.meterPhoto,
    },
    { new: true, runValidators: true }
  );
  
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found or cannot be updated' });
  }
  
  const populatedCollection = await Collection.findById(collection._id)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('supplierId', 'name purchaseRate');
  
  res.json(populatedCollection);
});

module.exports = {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
};

