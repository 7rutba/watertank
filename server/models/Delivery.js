const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
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
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryRate: {
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
  signature: {
    type: String, // Base64 or URL to signature image
    default: null,
  },
  signedBy: {
    type: String, // Name of person who signed
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  isInvoiced: {
    type: Boolean,
    default: false,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Calculate total amount before validation so required validator passes
deliverySchema.pre('validate', function(next) {
  const qty = Number(this.quantity) || 0;
  const rate = Number(this.deliveryRate) || 0;
  this.totalAmount = qty * rate;
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);

