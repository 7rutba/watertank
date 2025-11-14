const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { getPermissionsByRole } = require('../utils/permissions');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (Super Admin only for vendor creation)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, vendorId, societyId } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Validate role-specific requirements
  if (['driver', 'vendor', 'accountant'].includes(role) && !vendorId) {
    return res.status(400).json({ message: `${role} requires vendorId` });
  }

  if (role === 'society_admin' && !societyId) {
    return res.status(400).json({ message: 'society_admin requires societyId' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    vendorId: ['driver', 'vendor', 'accountant'].includes(role) ? vendorId : null,
    societyId: role === 'society_admin' ? societyId : null,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      societyId: user.societyId,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email })
    .populate('vendorId')
    .populate('societyId');

  if (user && (await user.comparePassword(password))) {
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get permissions for the user's role
    const permissions = getPermissionsByRole(user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      societyId: user.societyId,
      permissions,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('vendorId')
    .populate('societyId');
  
  // Get permissions for the user's role
  const permissions = getPermissionsByRole(user.role);
  
  res.json({
    ...user.toObject(),
    permissions,
  });
});

module.exports = {
  register,
  login,
  getMe,
};

