const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getRevenueTrends,
  getVendorsGrowth,
  getUsersGrowth,
  getSubscriptionsStats,
  getTransactionsTrends,
  getRevenueByVendor,
} = require('../controllers/analyticsController');
const { protect, superAdminOnly } = require('../middleware/auth');

router.use(protect, superAdminOnly);

router.get('/overview', getAnalyticsOverview);
router.get('/revenue', getRevenueTrends);
router.get('/vendors-growth', getVendorsGrowth);
router.get('/users-growth', getUsersGrowth);
router.get('/subscriptions-stats', getSubscriptionsStats);
router.get('/transactions', getTransactionsTrends);
router.get('/revenue-by-vendor', getRevenueByVendor);

module.exports = router;

