const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats,
} = require('../controllers/driverController');
const { protect, vendorAccess, authorize } = require('../middleware/auth');

// All routes require authentication and vendor access
router.use(protect, vendorAccess, authorize('vendor', 'accountant'));

router.route('/')
  .get(getDrivers)
  .post(createDriver);

router.route('/:id')
  .get(getDriver)
  .put(updateDriver)
  .delete(deleteDriver);

router.get('/:id/stats', getDriverStats);

module.exports = router;

