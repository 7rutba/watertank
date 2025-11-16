const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null,
  },
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    default: null,
  },
  category: {
    type: String,
    enum: ['fuel', 'toll', 'maintenance', 'food', 'medical', 'personal', 'other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  receipt: {
    type: String, // URL/path to uploaded receipt photo
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  // Indicates who bears this expense. Admin can re-assign. Fuel should remain 'vendor' by policy.
  chargedTo: {
    type: String,
    enum: ['vendor', 'driver'],
    default: 'vendor',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
  },
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);

