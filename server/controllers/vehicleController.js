const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all vehicles for vendor
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ vendorId: req.vendorId })
    .populate('driverId', 'name email phone')
    .sort({ vehicleNumber: 1 });
  res.json(vehicles);
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({
    _id: req.params.id,
    vendorId: req.vendorId,
  }).populate('driverId', 'name email phone');
  
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  res.json(vehicle);
});

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private (Vendor, Accountant)
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create({
    ...req.body,
    vendorId: req.vendorId,
  });
  
  const populatedVehicle = await Vehicle.findById(vehicle._id)
    .populate('driverId', 'name email phone');
  
  res.status(201).json(populatedVehicle);
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Vendor, Accountant)
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, vendorId: req.vendorId },
    req.body,
    { new: true, runValidators: true }
  ).populate('driverId', 'name email phone');
  
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  res.json(vehicle);
});

// @desc    Update vehicle location (GPS)
// @route   PUT /api/vehicles/:id/location
// @access  Private (Driver)
const updateVehicleLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, vendorId: req.vendorId },
    {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: new Date(),
      },
    },
    { new: true }
  );
  
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  res.json(vehicle);
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Vendor, Accountant)
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({
    _id: req.params.id,
    vendorId: req.vendorId,
  });
  
  if (!vehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
  
  res.json({ message: 'Vehicle removed' });
});

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  updateVehicleLocation,
  deleteVehicle,
};

