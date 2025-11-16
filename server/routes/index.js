const express = require('express');
const router = express.Router();

// Import controllers
const { getHealth } = require('../controllers/healthController');

// Import route modules
const authRoutes = require('./authRoutes');
const vendorRoutes = require('./vendorRoutes');
const supplierRoutes = require('./supplierRoutes');
const societyRoutes = require('./societyRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const collectionRoutes = require('./collectionRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const expenseRoutes = require('./expenseRoutes');
const paymentRoutes = require('./paymentRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const reportRoutes = require('./reportRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Health check route
router.get('/health', getHealth);

// API Routes
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/societies', societyRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/collections', collectionRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/payments', paymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/analytics', analyticsRoutes);
router.use('/vendor', require('./vendorDashboardRoutes'));
router.use('/driver', require('./driverDashboardRoutes'));
router.use('/drivers', require('./driverRoutes'));
router.use('/accountants', require('./accountantRoutes'));

module.exports = router;

