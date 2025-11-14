const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierPayments,
  getSupplierOutstanding,
  getSupplierStats,
} = require('../controllers/supplierController');
const { protect, vendorAccess, authorize } = require('../middleware/auth');

router.use(protect, vendorAccess);

router.route('/')
  .get(getSuppliers)
  .post(authorize('vendor', 'accountant'), createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(authorize('vendor', 'accountant'), updateSupplier)
  .delete(authorize('vendor', 'accountant'), deleteSupplier);

router.get('/:id/payments', getSupplierPayments);
router.get('/:id/outstanding', getSupplierOutstanding);
router.get('/:id/stats', getSupplierStats);

module.exports = router;

