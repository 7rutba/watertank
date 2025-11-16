const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseRate: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  meterPhoto: {
    type: String, // URL/path to uploaded photo
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Calculate total amount before validation so required validator passes
collectionSchema.pre('validate', function(next) {
  const qty = Number(this.quantity) || 0;
  const rate = Number(this.purchaseRate) || 0;
  this.totalAmount = qty * rate;
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);

