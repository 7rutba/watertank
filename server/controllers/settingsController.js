const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private/Super Admin
const getSettings = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};
  
  const settings = await Settings.find(query).sort({ category: 1, key: 1 });
  
  // Group by category
  const grouped = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});
  
  res.json(grouped);
});

// @desc    Get setting by key
// @route   GET /api/admin/settings/:key
// @access  Private/Super Admin
const getSetting = asyncHandler(async (req, res) => {
  const setting = await Settings.findOne({ key: req.params.key });
  
  if (!setting) {
    return res.status(404).json({ message: 'Setting not found' });
  }
  
  res.json(setting);
});

// @desc    Create or update setting
// @route   POST /api/admin/settings
// @access  Private/Super Admin
const upsertSetting = asyncHandler(async (req, res) => {
  const { key, category, value, label, description, type, isPublic } = req.body;
  
  const setting = await Settings.findOneAndUpdate(
    { key },
    {
      key,
      category,
      value,
      label,
      description,
      type: type || 'string',
      isPublic: isPublic || false,
    },
    { new: true, upsert: true, runValidators: true }
  );
  
  res.json(setting);
});

// @desc    Update setting
// @route   PUT /api/admin/settings/:key
// @access  Private/Super Admin
const updateSetting = asyncHandler(async (req, res) => {
  const setting = await Settings.findOneAndUpdate(
    { key: req.params.key },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!setting) {
    return res.status(404).json({ message: 'Setting not found' });
  }
  
  res.json(setting);
});

// @desc    Update multiple settings
// @route   PUT /api/admin/settings
// @access  Private/Super Admin
const updateMultipleSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body; // Array of { key, value } objects
  
  if (!Array.isArray(settings)) {
    return res.status(400).json({ message: 'Settings must be an array' });
  }
  
  const updatePromises = settings.map(async ({ key, value }) => {
    return Settings.findOneAndUpdate(
      { key },
      { value },
      { new: true }
    );
  });
  
  const updatedSettings = await Promise.all(updatePromises);
  res.json({ message: 'Settings updated successfully', settings: updatedSettings });
});

// @desc    Delete setting
// @route   DELETE /api/admin/settings/:key
// @access  Private/Super Admin
const deleteSetting = asyncHandler(async (req, res) => {
  const setting = await Settings.findOneAndDelete({ key: req.params.key });
  
  if (!setting) {
    return res.status(404).json({ message: 'Setting not found' });
  }
  
  res.json({ message: 'Setting deleted successfully' });
});

// @desc    Initialize default settings
// @route   POST /api/admin/settings/initialize
// @access  Private/Super Admin
const initializeDefaultSettings = asyncHandler(async (req, res) => {
  const defaultSettings = [
    // General Settings
    { key: 'platform_name', category: 'general', value: 'Watertank Platform', label: 'Platform Name', type: 'string' },
    { key: 'platform_email', category: 'general', value: 'admin@watertank.com', label: 'Platform Email', type: 'string' },
    { key: 'platform_phone', category: 'general', value: '+91 98765 43210', label: 'Platform Phone', type: 'string' },
    { key: 'timezone', category: 'general', value: 'Asia/Kolkata', label: 'Timezone', type: 'string' },
    { key: 'currency', category: 'general', value: 'INR', label: 'Currency', type: 'string' },
    
    // Email Settings
    { key: 'email_enabled', category: 'email', value: true, label: 'Enable Email', type: 'boolean' },
    { key: 'email_host', category: 'email', value: 'smtp.gmail.com', label: 'SMTP Host', type: 'string' },
    { key: 'email_port', category: 'email', value: 587, label: 'SMTP Port', type: 'number' },
    { key: 'email_secure', category: 'email', value: true, label: 'Use TLS', type: 'boolean' },
    { key: 'email_user', category: 'email', value: '', label: 'SMTP Username', type: 'string' },
    { key: 'email_password', category: 'email', value: '', label: 'SMTP Password', type: 'string' },
    { key: 'email_from', category: 'email', value: 'noreply@watertank.com', label: 'From Email', type: 'string' },
    
    // SMS Settings
    { key: 'sms_enabled', category: 'sms', value: false, label: 'Enable SMS', type: 'boolean' },
    { key: 'sms_provider', category: 'sms', value: 'twilio', label: 'SMS Provider', type: 'string' },
    { key: 'sms_api_key', category: 'sms', value: '', label: 'SMS API Key', type: 'string' },
    { key: 'sms_api_secret', category: 'sms', value: '', label: 'SMS API Secret', type: 'string' },
    { key: 'sms_sender_id', category: 'sms', value: 'WATERTK', label: 'Sender ID', type: 'string' },
    
    // Payment Settings
    { key: 'payment_gateway', category: 'payment', value: 'razorpay', label: 'Payment Gateway', type: 'string' },
    { key: 'razorpay_key', category: 'payment', value: '', label: 'Razorpay Key', type: 'string' },
    { key: 'razorpay_secret', category: 'payment', value: '', label: 'Razorpay Secret', type: 'string' },
    { key: 'stripe_key', category: 'payment', value: '', label: 'Stripe Key', type: 'string' },
    { key: 'stripe_secret', category: 'payment', value: '', label: 'Stripe Secret', type: 'string' },
    
    // System Settings
    { key: 'maintenance_mode', category: 'system', value: false, label: 'Maintenance Mode', type: 'boolean' },
    { key: 'maintenance_message', category: 'system', value: 'System is under maintenance', label: 'Maintenance Message', type: 'string' },
    { key: 'session_timeout', category: 'system', value: 3600, label: 'Session Timeout (seconds)', type: 'number' },
    { key: 'max_upload_size', category: 'system', value: 5242880, label: 'Max Upload Size (bytes)', type: 'number' },
    
    // Notification Settings
    { key: 'notify_new_vendor', category: 'notification', value: true, label: 'Notify on New Vendor', type: 'boolean' },
    { key: 'notify_payment', category: 'notification', value: true, label: 'Notify on Payment', type: 'boolean' },
    { key: 'notify_subscription_expiry', category: 'notification', value: true, label: 'Notify on Subscription Expiry', type: 'boolean' },
  ];
  
  const createdSettings = [];
  for (const setting of defaultSettings) {
    const existing = await Settings.findOne({ key: setting.key });
    if (!existing) {
      const created = await Settings.create(setting);
      createdSettings.push(created);
    }
  }
  
  res.json({ 
    message: 'Default settings initialized', 
    created: createdSettings.length,
    total: defaultSettings.length 
  });
});

module.exports = {
  getSettings,
  getSetting,
  upsertSetting,
  updateSetting,
  updateMultipleSettings,
  deleteSetting,
  initializeDefaultSettings,
};

