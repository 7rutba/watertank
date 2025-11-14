const express = require('express');
const router = express.Router();
const { getDriverDashboardStats, getDriverRecentTrips } = require('../controllers/driverDashboardController');
const { protect, driverOnly } = require('../middleware/auth');

router.use(protect, driverOnly);

router.get('/dashboard/stats', getDriverDashboardStats);
router.get('/dashboard/recent-trips', getDriverRecentTrips);

module.exports = router;

