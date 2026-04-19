const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, getOtpUser, getOtpStatus, verifyLoginOtp, getAllUsers, updateUserRole 
} = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../utils/auth');

router.post('/getOtp', getOtpUser);
router.post('/otp-status', getOtpStatus);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOtp);

// Admin-only endpoints
router.get('/', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.patch('/:id/role', authMiddleware, authorizeRoles('admin'), updateUserRole);

module.exports = router;