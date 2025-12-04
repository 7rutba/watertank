const Vendor = require('../models/Vendor');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');

// Generate unique vendor ID
const generateVendorId = async () => {
  const count = await Vendor.countDocuments();
  const vendorId = `VENDOR-${String(count + 1).padStart(4, '0')}`;
  
  // Check if ID already exists (unlikely but safe)
  const exists = await Vendor.findOne({ vendorId });
  if (exists) {
    // If exists, try with timestamp
    return `VENDOR-${Date.now().toString().slice(-6)}`;
  }
  
  return vendorId;
};

// Generate random password
const generatePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// @desc    Get all vendors (Super Admin only)
// @route   GET /api/vendors
// @access  Private/Super Admin
const getVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find()
    .populate('subscription.planId', 'name displayName price')
    .sort({ createdAt: -1 });
  res.json(vendors);
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('subscription.planId', 'name displayName price');
  
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  // Check access
  if (req.user.role !== 'super_admin' && req.user.vendorId?.toString() !== vendor._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(vendor);
});

// @desc    Create vendor with user account and subscription (Super Admin only)
// @route   POST /api/vendors
// @access  Private/Super Admin
const createVendor = asyncHandler(async (req, res) => {
  const {
    businessName,
    ownerName,
    email,
    phone,
    address,
    gstNumber,
    panNumber,
    bankDetails,
    subscriptionPlanId,
    password,
    generatePassword: shouldGeneratePassword = true,
    billingCycle = 'monthly',
  } = req.body;

  // Check if vendor email already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return res.status(400).json({ message: 'Vendor with this email already exists' });
  }

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Generate vendor ID
  const vendorId = await generateVendorId();

  // Generate or use provided password
  const vendorPassword = shouldGeneratePassword ? generatePassword() : password;
  
  if (!vendorPassword || vendorPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Get subscription plan if provided
  let subscriptionPlan = null;
  if (subscriptionPlanId) {
    subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
  } else {
    // Get default plan
    subscriptionPlan = await SubscriptionPlan.findOne({ isDefault: true });
    if (!subscriptionPlan) {
      // Get first active plan as fallback
      subscriptionPlan = await SubscriptionPlan.findOne({ isActive: true });
    }
  }

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date(startDate);
  
  if (subscriptionPlan) {
    switch (billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }
  }

  // Create vendor
  const vendor = await Vendor.create({
    vendorId,
    businessName,
    ownerName,
    email,
    phone,
    address: address || {},
    gstNumber,
    panNumber,
    bankDetails: bankDetails || {},
    subscription: subscriptionPlan ? {
      plan: subscriptionPlan.name,
      planId: subscriptionPlan._id,
      startDate,
      endDate,
      isActive: true,
    } : {
      plan: 'basic',
      startDate,
      endDate,
      isActive: false,
    },
    isActive: true,
  });

  // Create user account for vendor
  const vendorUser = await User.create({
    name: ownerName,
    email,
    password: vendorPassword,
    role: 'vendor',
    phone,
    vendorId: vendor._id,
    isActive: true,
  });

  // Create subscription record if plan exists
  if (subscriptionPlan) {
    await Subscription.create({
      vendorId: vendor._id,
      planId: subscriptionPlan._id,
      startDate,
      endDate,
      billingCycle,
      amount: subscriptionPlan.price,
      status: 'active',
      autoRenew: true,
      nextBillingDate: endDate,
    });
  }

  // Populate vendor with subscription plan details
  const populatedVendor = await Vendor.findById(vendor._id)
    .populate('subscription.planId', 'name displayName price billingCycle');

  res.status(201).json({
    vendor: populatedVendor,
    credentials: {
      vendorId,
      email,
      password: vendorPassword, // Return plain password only on creation
      userId: vendorUser._id,
    },
    message: 'Vendor created successfully',
  });
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

  const {
    businessName,
    ownerName,
    email,
    phone,
    address,
    gstNumber,
    panNumber,
    bankDetails,
    subscriptionPlanId,
    billingCycle,
    isActive,
  } = req.body;

  // Update vendor user account if email or owner name changes
  const vendorUser = await User.findOne({ vendorId: vendor._id, role: 'vendor' });
  if (vendorUser) {
    let userUpdated = false;
    
    // Check if email is being changed and if it conflicts
    if (email && email !== vendor.email) {
      const emailExists = await Vendor.findOne({ email, _id: { $ne: vendor._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another vendor' });
      }
      vendorUser.email = email;
      userUpdated = true;
    }
    
    // Update user name if owner name changes
    if (ownerName && ownerName !== vendor.ownerName) {
      vendorUser.name = ownerName;
      userUpdated = true;
    }
    
    // Update phone if it changes
    if (phone && phone !== vendor.phone) {
      vendorUser.phone = phone;
      userUpdated = true;
    }
    
    if (userUpdated) {
      await vendorUser.save();
    }
  }

  // Handle subscription plan update
  let subscriptionUpdate = {};
  if (subscriptionPlanId) {
    const subscriptionPlan = await SubscriptionPlan.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Calculate new subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    const cycle = billingCycle || subscriptionPlan.billingCycle || 'monthly';
    
    switch (cycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    subscriptionUpdate = {
      plan: subscriptionPlan.name,
      planId: subscriptionPlan._id,
      startDate,
      endDate,
      isActive: true,
    };

    // Update or create subscription record
    let subscription = await Subscription.findOne({ vendorId: vendor._id });
    if (subscription) {
      subscription.planId = subscriptionPlan._id;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.billingCycle = cycle;
      subscription.amount = subscriptionPlan.price;
      subscription.status = 'active';
      subscription.nextBillingDate = endDate;
      await subscription.save();
    } else {
      await Subscription.create({
        vendorId: vendor._id,
        planId: subscriptionPlan._id,
        startDate,
        endDate,
        billingCycle: cycle,
        amount: subscriptionPlan.price,
        status: 'active',
        autoRenew: true,
        nextBillingDate: endDate,
      });
    }
  }

  // Prepare update object
  const updateData = {
    businessName: businessName !== undefined ? businessName : vendor.businessName,
    ownerName: ownerName !== undefined ? ownerName : vendor.ownerName,
    email: email !== undefined ? email : vendor.email,
    phone: phone !== undefined ? phone : vendor.phone,
    address: address !== undefined ? { ...vendor.address, ...address } : vendor.address,
    gstNumber: gstNumber !== undefined ? gstNumber : vendor.gstNumber,
    panNumber: panNumber !== undefined ? panNumber : vendor.panNumber,
    bankDetails: bankDetails !== undefined ? { ...vendor.bankDetails, ...bankDetails } : vendor.bankDetails,
    isActive: isActive !== undefined ? isActive : vendor.isActive,
  };

  // Add subscription update if provided
  if (Object.keys(subscriptionUpdate).length > 0) {
    updateData.subscription = { ...vendor.subscription, ...subscriptionUpdate };
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('subscription.planId', 'name displayName price billingCycle');
  
  res.json(updatedVendor);
});

// @desc    Reset vendor password (Super Admin only)
// @route   PUT /api/vendors/:id/reset-password
// @access  Private/Super Admin
const resetVendorPassword = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }

  const { password, generatePassword: shouldGeneratePassword = true } = req.body;

  // Generate or use provided password
  const vendorPassword = shouldGeneratePassword ? generatePassword() : password;
  
  if (!vendorPassword || vendorPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Find and update vendor user account
  const vendorUser = await User.findOne({ vendorId: vendor._id, role: 'vendor' });
  
  if (!vendorUser) {
    return res.status(404).json({ message: 'Vendor user account not found' });
  }

  // Update password (will be hashed by pre-save hook)
  vendorUser.password = vendorPassword;
  await vendorUser.save();

  res.json({
    message: 'Vendor password reset successfully',
    credentials: {
      vendorId: vendor.vendorId,
      email: vendor.email,
      password: vendorPassword, // Return plain password only on reset
    },
  });
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
  resetVendorPassword,
};

