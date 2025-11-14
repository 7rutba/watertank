const Vendor = require('../models/Vendor');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all vendors (Super Admin only)
// @route   GET /api/vendors
// @access  Private/Super Admin
const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().sort({ createdAt: -1 });
  res.json(vendors);
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  // Check access
  if (req.user.role !== 'super_admin' && req.user.vendorId?.toString() !== vendor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(vendor);
});

// @desc    Create vendor (Super Admin only)
// @route   POST /api/vendors
// @access  Private/Super Admin
const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.status(201).json(vendor);
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  // Check access
  if (req.user.role !== 'super_admin' && req.user.vendorId?.toString() !== vendor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json(updatedVendor);
});

// @desc    Delete vendor (Super Admin only)
// @route   DELETE /api/vendors/:id
// @access  Private/Super Admin
const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  await vendor.deleteOne();
  res.json({ message: 'Vendor removed' });
});

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
};

