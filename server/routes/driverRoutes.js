const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats,
  markAttendance,
  getAttendance,
  getSalary,
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

// Attendance routes
router.post('/:id/attendance', markAttendance);
router.get('/:id/attendance', getAttendance);

// Salary calculation
router.get('/:id/salary', getSalary);

module.exports = router;

