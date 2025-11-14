const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
  purchaseRate: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentTerms: {
    type: String,
    enum: ['cash', 'credit_7', 'credit_15', 'credit_30', 'per_collection'],
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

module.exports = mongoose.model('Supplier', supplierSchema);

