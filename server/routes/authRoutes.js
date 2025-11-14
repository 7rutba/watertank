const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, superAdminOnly } = require('../middleware/auth');

router.post('/register', protect, superAdminOnly, register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;

