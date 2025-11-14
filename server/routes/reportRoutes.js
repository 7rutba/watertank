const express = require('express');
const router = express.Router();
const {
  getProfitLoss,
  getOutstanding,
  getMonthlyReport,
} = require('../controllers/reportController');
const { protect, vendorAccess, authorize } = require('../middleware/auth');

router.use(protect, vendorAccess, authorize('vendor', 'accountant'));

router.get('/profit-loss', getProfitLoss);
router.get('/outstanding', getOutstanding);
router.get('/monthly', getMonthlyReport);

module.exports = router;

