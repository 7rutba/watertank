const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect, superAdminOnly, vendorAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(superAdminOnly, getVendors)
  .post(superAdminOnly, createVendor);

router.route('/:id')
  .get(vendorAccess, getVendor)
  .put(vendorAccess, updateVendor)
  .delete(superAdminOnly, deleteVendor);

module.exports = router;

