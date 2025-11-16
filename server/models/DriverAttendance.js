const mongoose = require('mongoose');

const driverAttendanceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Stored as start-of-day (00:00:00) in vendor's local timezone (assume server timezone)
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half'],
    required: true,
    default: 'present',
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Ensure one record per driver per day per vendor
driverAttendanceSchema.index({ vendorId: 1, driverId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DriverAttendance', driverAttendanceSchema);


