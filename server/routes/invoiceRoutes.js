const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  generateMonthlyInvoice,
  updateInvoice,
  sendInvoice,
  downloadInvoicePDF,
} = require('../controllers/invoiceController');
const { protect, vendorAccess, societyAccess, authorize } = require('../middleware/auth');

router.use(protect);

// Vendor/Accountant routes
router.use(vendorAccess);
router.route('/')
  .get(getInvoices);

router.post('/generate-monthly', authorize('vendor', 'accountant'), generateMonthlyInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(authorize('vendor', 'accountant'), updateInvoice);

router.put('/:id/send', authorize('vendor', 'accountant'), sendInvoice);
router.get('/:id/download', downloadInvoicePDF);

// Society Admin routes
router.get('/society/my-invoices', societyAccess, getInvoices);
router.get('/society/:id', societyAccess, getInvoice);

module.exports = router;

