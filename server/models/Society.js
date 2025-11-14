const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  deliveryRate: {
    type: Number,
    required: true,
    default: 0,
  },
  pricingType: {
    type: String,
    enum: ['per_liter', 'fixed_rate'],
    default: 'per_liter',
  },
  paymentTerms: {
    type: String,
    enum: ['cash', 'credit_7', 'credit_15', 'credit_30'],
    default: 'cash',
  },
  creditLimit: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Society', societySchema);

