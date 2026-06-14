import express from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword, getProfile, getPublicStats } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify', protect, verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.get('/public-stats', getPublicStats);

export default router;
