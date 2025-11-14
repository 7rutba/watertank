const express = require('express');
const router = express.Router();
const {
  getSocieties,
  getSociety,
  createSociety,
  updateSociety,
  deleteSociety,
  getSocietyDeliveries,
  getSocietyOutstanding,
  getSocietyStats,
} = require('../controllers/societyController');
const { protect, vendorAccess, societyAccess, authorize } = require('../middleware/auth');

router.use(protect);

// Vendor/Accountant routes
router.use(vendorAccess);
router.route('/')
  .get(getSocieties)
  .post(authorize('vendor', 'accountant'), createSociety);

router.route('/:id')
  .get(getSociety)
  .put(authorize('vendor', 'accountant'), updateSociety)
  .delete(authorize('vendor', 'accountant'), deleteSociety);

router.get('/:id/deliveries', getSocietyDeliveries);
router.get('/:id/outstanding', getSocietyOutstanding);
router.get('/:id/stats', getSocietyStats);

// Society Admin routes (for viewing their own society)
router.get('/me/society', societyAccess, getSociety);

module.exports = router;

