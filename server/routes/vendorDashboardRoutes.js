const express = require('express');
const router = express.Router();
const {
  getVendorDashboardStats,
  getVendorRecentActivity,
} = require('../controllers/vendorDashboardController');
const { protect, vendorOnly } = require('../middleware/auth');

// All routes require authentication and vendor role
router.use(protect, vendorOnly);

router.get('/dashboard/stats', getVendorDashboardStats);
router.get('/dashboard/recent-activity', getVendorRecentActivity);

module.exports = router;

