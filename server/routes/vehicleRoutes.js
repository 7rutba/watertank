const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  updateVehicleLocation,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect, vendorAccess, authorize, driverOnly } = require('../middleware/auth');

router.use(protect, vendorAccess);

router.route('/')
  .get(getVehicles)
  .post(authorize('vendor', 'accountant'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('vendor', 'accountant'), updateVehicle)
  .delete(authorize('vendor', 'accountant'), deleteVehicle);

router.put('/:id/location', driverOnly, updateVehicleLocation);

module.exports = router;

