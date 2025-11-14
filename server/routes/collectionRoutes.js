const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
} = require('../controllers/collectionController');
const { protect, vendorAccess, driverOnly } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect, vendorAccess);

router.route('/')
  .get(getCollections)
  .post(driverOnly, uploadSingle('meterPhoto'), createCollection);

router.route('/:id')
  .get(getCollection)
  .put(driverOnly, uploadSingle('meterPhoto'), updateCollection);

module.exports = router;

