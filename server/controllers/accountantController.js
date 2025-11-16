const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    List accountants for vendor
// @route   GET /api/accountants
// @access  Private (Vendor, Accountant)
const listAccountants = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  const users = await User.find({ vendorId, role: 'accountant' }).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Create accountant for vendor
// @route   POST /api/accountants
// @access  Private (Vendor only)
const createAccountant = asyncHandler(async (req, res) => {
  const vendorId = req.vendorId || req.user.vendorId;
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'accountant',
    phone: phone || '',
    vendorId,
    isActive: true,
  });

  const safe = user.toObject();
  delete safe.password;
  res.status(201).json(safe);
});

module.exports = {
  listAccountants,
  createAccountant,
};


