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

// Calculate total amount before saving
collectionSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.purchaseRate;
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);

