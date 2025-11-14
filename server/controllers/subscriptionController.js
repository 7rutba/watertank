const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Vendor = require('../models/Vendor');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all subscription plans
// @route   GET /api/admin/subscriptions/plans
// @access  Private/Super Admin
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ price: 1 });
  res.json(plans);
});

// @desc    Create subscription plan
// @route   POST /api/admin/subscriptions/plans
// @access  Private/Super Admin
const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  res.status(201).json(plan);
});

// @desc    Update subscription plan
// @route   PUT /api/admin/subscriptions/plans/:id
// @access  Private/Super Admin
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!plan) {
    return res.status(404).json({ message: 'Subscription plan not found' });
  }
  
  res.json(plan);
});

// @desc    Delete subscription plan
// @route   DELETE /api/admin/subscriptions/plans/:id
// @access  Private/Super Admin
const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findById(req.params.id);
  
  if (!plan) {
    return res.status(404).json({ message: 'Subscription plan not found' });
  }
  
  // Check if plan is being used
  const activeSubscriptions = await Subscription.countDocuments({ planId: plan._id });
  if (activeSubscriptions > 0) {
    return res.status(400).json({ 
      message: `Cannot delete plan. It has ${activeSubscriptions} active subscription(s)` 
    });
  }
  
  await plan.deleteOne();
  res.json({ message: 'Subscription plan deleted successfully' });
});

// @desc    Get all vendor subscriptions
// @route   GET /api/admin/subscriptions
// @access  Private/Super Admin
const getSubscriptions = asyncHandler(async (req, res) => {
  const { status, planId } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (planId) query.planId = planId;
  
  const subscriptions = await Subscription.find(query)
    .populate('vendorId', 'businessName email phone')
    .populate('planId', 'name displayName price billingCycle')
    .sort({ createdAt: -1 });
  
  res.json(subscriptions);
});

// @desc    Get single subscription
// @route   GET /api/admin/subscriptions/:id
// @access  Private/Super Admin
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('vendorId')
    .populate('planId');
  
  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }
  
  res.json(subscription);
});

// @desc    Create/Assign subscription to vendor
// @route   POST /api/admin/subscriptions
// @access  Private/Super Admin
const createSubscription = asyncHandler(async (req, res) => {
  const { vendorId, planId, startDate, billingCycle, autoRenew } = req.body;
  
  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return res.status(404).json({ message: 'Vendor not found' });
  }
  
  // Check if vendor already has subscription
  const existingSubscription = await Subscription.findOne({ vendorId });
  if (existingSubscription) {
    return res.status(400).json({ message: 'Vendor already has an active subscription' });
  }
  
  // Get plan details
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ message: 'Subscription plan not found' });
  }
  
  // Calculate end date based on billing cycle
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  
  switch (billingCycle || plan.billingCycle) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  
  const subscription = await Subscription.create({
    vendorId,
    planId,
    startDate: start,
    endDate: end,
    billingCycle: billingCycle || plan.billingCycle,
    amount: plan.price,
    autoRenew: autoRenew !== undefined ? autoRenew : true,
    nextBillingDate: end,
  });
  
  // Update vendor subscription info
  vendor.subscription = {
    plan: plan.name,
    startDate: start,
    endDate: end,
    isActive: true,
  };
  await vendor.save();
  
  const populatedSubscription = await Subscription.findById(subscription._id)
    .populate('vendorId', 'businessName email')
    .populate('planId', 'name displayName price');
  
  res.status(201).json(populatedSubscription);
});

// @desc    Update subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Private/Super Admin
const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  
  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }
  
  // If plan is being changed, recalculate dates
  if (req.body.planId && req.body.planId.toString() !== subscription.planId.toString()) {
    const plan = await SubscriptionPlan.findById(req.body.planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    
    const start = req.body.startDate ? new Date(req.body.startDate) : subscription.startDate;
    const end = new Date(start);
    
    const billingCycle = req.body.billingCycle || plan.billingCycle;
    switch (billingCycle) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    
    req.body.endDate = end;
    req.body.amount = plan.price;
    req.body.nextBillingDate = end;
  }
  
  const updatedSubscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('vendorId', 'businessName email').populate('planId', 'name displayName price');
  
  res.json(updatedSubscription);
});

// @desc    Cancel subscription
// @route   PUT /api/admin/subscriptions/:id/cancel
// @access  Private/Super Admin
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  
  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }
  
  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  await subscription.save();
  
  // Update vendor
  const vendor = await Vendor.findById(subscription.vendorId);
  if (vendor) {
    vendor.subscription.isActive = false;
    await vendor.save();
  }
  
  res.json({ message: 'Subscription cancelled successfully', subscription });
});

module.exports = {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
};

