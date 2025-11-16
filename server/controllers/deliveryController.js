const Delivery = require('../models/Delivery');
const Society = require('../models/Society');
const Vehicle = require('../models/Vehicle');
const Collection = require('../models/Collection');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
const getDeliveries = asyncHandler(async (req, res) => {
  const { status, driverId, societyId, isInvoiced, startDate, endDate } = req.query;
  
  const filter = {};
  
  // Vendor/Driver/Accountant - filter by vendorId
  if (req.vendorId) {
    filter.vendorId = req.vendorId;
  }
  
  // Society Admin - filter by societyId
  if (req.societyId) {
    filter.societyId = req.societyId;
  }
  
  // Drivers can only see their own deliveries
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  } else if (driverId) {
    filter.driverId = driverId;
  }
  
  if (status) filter.status = status;
  if (societyId) filter.societyId = societyId;
  if (isInvoiced !== undefined) filter.isInvoiced = isInvoiced === 'true';
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const deliveries = await Delivery.find(filter)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('societyId', 'name deliveryRate')
    .populate('collectionId')
    .sort({ createdAt: -1 });
  
  res.json(deliveries);
});

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
const getDelivery = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) {
    filter.vendorId = req.vendorId;
  }
  if (req.societyId) {
    filter.societyId = req.societyId;
  }
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  }
  
  const delivery = await Delivery.findOne(filter)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('societyId', 'name deliveryRate address')
    .populate('collectionId');
  
  if (!delivery) {
    return res.status(404).json({ message: 'Delivery not found' });
  }
  
  res.json(delivery);
});

// @desc    Create delivery (Driver)
// @route   POST /api/deliveries
// @access  Private (Driver)
const createDelivery = asyncHandler(async (req, res) => {
  let { vehicleId, societyId, collectionId, quantity, deliveryRate, location, signedBy, notes } = req.body;
  
  // Parse location if it's a JSON string (from FormData)
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }
  
  // Get society to get delivery rate if not provided
  const society = await Society.findOne({ _id: societyId, vendorId: req.vendorId });
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  
  // Verify vehicle belongs to vendor
  const vehicle = await Vehicle.findOne({ _id: vehicleId, vendorId: req.vendorId });
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  // Verify collection if provided
  if (collectionId) {
    const collection = await Collection.findOne({ _id: collectionId, vendorId: req.vendorId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
  }

  // Coerce numeric values and normalize deliveryRate to per-liter
  const qtyNum = Number(quantity) || 0;
  const capacity = Number(vehicle.capacity) || 0;
  let ratePerLiter = Number(deliveryRate);
  if (!ratePerLiter || !isFinite(ratePerLiter)) {
    // Fallback: compute per-liter from society per-tanker rate and vehicle capacity
    ratePerLiter = capacity > 0 ? Number(society.deliveryRate) / capacity : undefined;
  }
  if (!ratePerLiter || !isFinite(ratePerLiter)) {
    return res.status(400).json({ message: 'Invalid delivery rate or vehicle capacity' });
  }

  const delivery = await Delivery.create({
    vendorId: req.vendorId,
    vehicleId,
    driverId: req.user._id,
    societyId,
    collectionId: collectionId || null,
    quantity: qtyNum,
    deliveryRate: ratePerLiter,
    location,
    meterPhoto: req.files?.meterPhoto ? req.files.meterPhoto[0].path : null,
    signature: req.files?.signature ? req.files.signature[0].path : null,
    signedBy,
    notes,
    status: 'completed',
  });
  
  const populatedDelivery = await Delivery.findById(delivery._id)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('societyId', 'name deliveryRate')
    .populate('collectionId');
  
  res.status(201).json(populatedDelivery);
});

// @desc    Update delivery
// @route   PUT /api/deliveries/:id
// @access  Private
const updateDelivery = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  
  if (req.vendorId) filter.vendorId = req.vendorId;
  if (req.societyId) filter.societyId = req.societyId;
  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
    filter.status = 'pending'; // Drivers can only update pending deliveries
  }
  
  const updateData = { ...req.body };
  if (req.files?.meterPhoto) updateData.meterPhoto = req.files.meterPhoto[0].path;
  if (req.files?.signature) updateData.signature = req.files.signature[0].path;
  
  const delivery = await Delivery.findOneAndUpdate(
    filter,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!delivery) {
    return res.status(404).json({ message: 'Delivery not found or cannot be updated' });
  }
  
  const populatedDelivery = await Delivery.findById(delivery._id)
    .populate('vehicleId', 'vehicleNumber capacity')
    .populate('driverId', 'name email phone')
    .populate('societyId', 'name deliveryRate')
    .populate('collectionId');
  
  res.json(populatedDelivery);
});

module.exports = {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
};

