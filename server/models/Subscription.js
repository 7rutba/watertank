const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active',
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  lastPaymentDate: {
    type: Date,
  },
  nextBillingDate: {
    type: Date,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentHistory: [{
    date: Date,
    amount: Number,
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
    },
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
subscriptionSchema.index({ vendorId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

