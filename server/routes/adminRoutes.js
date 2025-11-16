const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getRecentActivity,
  getSystemStats,
} = require('../controllers/adminDashboardController');
const {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const {
  getSettings,
  getSetting,
  upsertSetting,
  updateSetting,
  updateMultipleSettings,
  deleteSetting,
  initializeDefaultSettings,
} = require('../controllers/settingsController');
const { assignExpenseCharge, getAllExpensesAdmin, getExpenseAdmin } = require('../controllers/expenseController');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  addReply,
  getTicketStats,
} = require('../controllers/supportController');
const { protect, superAdminOnly } = require('../middleware/auth');

// All routes require authentication and super admin role
router.use(protect, superAdminOnly);

// Dashboard routes
router.get('/dashboard/stats', getAdminDashboardStats);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/system-stats', getSystemStats);

// Subscription Plan routes
router.get('/subscriptions/plans', getSubscriptionPlans);
router.post('/subscriptions/plans', createSubscriptionPlan);
router.put('/subscriptions/plans/:id', updateSubscriptionPlan);
router.delete('/subscriptions/plans/:id', deleteSubscriptionPlan);

// Subscription routes
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscription);
router.post('/subscriptions', createSubscription);
router.put('/subscriptions/:id', updateSubscription);
router.put('/subscriptions/:id/cancel', cancelSubscription);

// Settings routes
router.get('/settings', getSettings);
router.post('/settings/initialize', initializeDefaultSettings);
router.get('/settings/:key', getSetting);
router.post('/settings', upsertSetting);
router.put('/settings', updateMultipleSettings);
router.put('/settings/:key', updateSetting);
router.delete('/settings/:key', deleteSetting);

// Expense assignment (Admin decides who bears driver expenses)
router.get('/expenses', getAllExpensesAdmin);
router.get('/expenses/:id', getExpenseAdmin);
router.put('/expenses/:id/assign', assignExpenseCharge);

// Support Ticket routes
router.get('/support/tickets', getTickets);
router.get('/support/tickets/stats', getTicketStats);
router.get('/support/tickets/:id', getTicket);
router.post('/support/tickets', createTicket);
router.put('/support/tickets/:id', updateTicket);
router.post('/support/tickets/:id/reply', addReply);

module.exports = router;

