const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ['general', 'email', 'sms', 'payment', 'system', 'notification'],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string',
  },
  isPublic: {
    type: Boolean,
    default: false, // Public settings can be accessed without auth
  },
}, {
  timestamps: true,
});

// Static method to get settings by category
settingsSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

// Static method to get setting by key
settingsSchema.statics.getByKey = function(key) {
  return this.findOne({ key });
};

module.exports = mongoose.model('Settings', settingsSchema);

