const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password').populate('vendorId').populate('societyId');
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
});

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Super Admin only
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

// Vendor access check (vendor, driver, accountant)
const vendorAccess = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (['vendor', 'driver', 'accountant'].includes(req.user.role)) {
    if (!req.user.vendorId) {
      return res.status(403).json({ message: 'Vendor ID not associated with user' });
    }
    req.vendorId = req.user.vendorId;
    return next();
  }
  
  return res.status(403).json({ message: 'Access denied' });
});

// Society admin access check
const societyAccess = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'society_admin') {
    if (!req.user.societyId) {
      return res.status(403).json({ message: 'Society ID not associated with user' });
    }
    req.societyId = req.user.societyId;
    return next();
  }
  
  return res.status(403).json({ message: 'Society admin access required' });
});

// Driver only
const driverOnly = (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Driver access required' });
  }
  next();
};

// Vendor only
const vendorOnly = (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  if (!req.user.vendorId) {
    return res.status(403).json({ message: 'Vendor ID not associated with user' });
  }
  req.vendorId = req.user.vendorId;
  next();
};

module.exports = {
  protect,
  authorize,
  superAdminOnly,
  vendorAccess,
  vendorOnly,
  societyAccess,
  driverOnly,
};

