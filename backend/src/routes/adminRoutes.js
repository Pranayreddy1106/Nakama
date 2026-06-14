import express from 'express';
import { 
  getAdminStats, 
  getAllUsersAdmin, 
  updateUserStatus, 
  getFlaggedReports, 
  handleReportModeration 
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsersAdmin);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);
router.get('/reports', protect, adminOnly, getFlaggedReports);
router.put('/reports/:id/resolve', protect, adminOnly, handleReportModeration);

export default router;
