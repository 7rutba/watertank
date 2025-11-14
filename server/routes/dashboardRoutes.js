const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect, vendorAccess, authorize } = require('../middleware/auth');

router.use(protect, vendorAccess, authorize('vendor', 'accountant'));

router.get('/', getDashboard);

module.exports = router;

