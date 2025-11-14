const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
} = require('../controllers/paymentController');
const { protect, vendorAccess, societyAccess, authorize } = require('../middleware/auth');

router.use(protect);

// Vendor/Accountant routes
router.use(vendorAccess);
router.route('/')
  .get(getPayments)
  .post(authorize('vendor', 'accountant'), createPayment);

// Society Admin routes (for creating payments)
router.post('/society', societyAccess, createPayment);

router.route('/:id')
  .get(getPayment)
  .put(authorize('vendor', 'accountant'), updatePayment);

module.exports = router;

