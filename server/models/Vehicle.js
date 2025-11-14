const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    enum: ['tanker', 'tractor', 'truck', 'other'],
    default: 'tanker',
  },
  capacity: {
    type: Number,
    required: true,
    default: 0, // in liters
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vehicle', vehicleSchema);

