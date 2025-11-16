const express = require('express');
const router = express.Router();
const { listAccountants, createAccountant } = require('../controllers/accountantController');
const { protect, vendorAccess, vendorOnly, authorize } = require('../middleware/auth');

// All routes require vendor context
router.use(protect, vendorAccess);

// List accountants (vendor and accountant can view)
router.get('/', authorize('vendor', 'accountant'), listAccountants);

// Create accountant (vendor only)
router.post('/', authorize('vendor'), createAccountant);

module.exports = router;


