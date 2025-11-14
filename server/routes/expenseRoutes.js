const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  approveExpense,
  updateExpense,
} = require('../controllers/expenseController');
const { protect, vendorAccess, authorize, driverOnly } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect, vendorAccess);

router.route('/')
  .get(getExpenses)
  .post(driverOnly, uploadSingle('receipt'), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(driverOnly, uploadSingle('receipt'), updateExpense);

router.put('/:id/approve', authorize('vendor', 'accountant'), approveExpense);

module.exports = router;

