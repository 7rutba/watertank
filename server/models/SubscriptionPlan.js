const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  features: [{
    name: String,
    included: {
      type: Boolean,
      default: true,
    },
  }],
  limits: {
    vendors: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    users: {
      type: Number,
      default: -1,
    },
    vehicles: {
      type: Number,
      default: -1,
    },
    storage: {
      type: Number, // in MB
      default: -1,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one default plan
subscriptionPlanSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('SubscriptionPlan').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

