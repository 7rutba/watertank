const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  resetVendorPassword,
} = require('../controllers/vendorController');
const { protect, superAdminOnly, vendorAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(superAdminOnly, getVendors)
  .post(superAdminOnly, createVendor);

// Specific routes must come before parameterized routes
router.route('/:id/reset-password')
  .put(superAdminOnly, resetVendorPassword);

router.route('/:id')
  .get(vendorAccess, getVendor)
  .put(vendorAccess, updateVendor)
  .delete(superAdminOnly, deleteVendor);

module.exports = router;

