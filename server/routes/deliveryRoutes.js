const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
} = require('../controllers/deliveryController');
const { protect, vendorAccess, societyAccess, driverOnly } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(protect);

// Vendor/Driver routes
router.use(vendorAccess);
router.route('/')
  .get(getDeliveries)
  .post(driverOnly, upload.fields([
    { name: 'meterPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]), createDelivery);

router.route('/:id')
  .get(getDelivery)
  .put(driverOnly, upload.fields([
    { name: 'meterPhoto', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]), updateDelivery);

// Society Admin routes
router.get('/society/my-deliveries', societyAccess, getDeliveries);

module.exports = router;

