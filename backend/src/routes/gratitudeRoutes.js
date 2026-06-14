import express from 'express';
import { 
  getGratitudes, 
  createGratitude, 
  toggleSupportGratitude 
} from '../controllers/gratitudeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getGratitudes);
router.post('/', protect, createGratitude);
router.post('/:id/support', protect, toggleSupportGratitude);

export default router;
