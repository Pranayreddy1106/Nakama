import express from 'express';
import { 
  getMoodEntries, 
  createOrUpdateMood, 
  editMoodEntry, 
  getMoodInsights 
} from '../controllers/moodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMoodEntries);
router.post('/', protect, createOrUpdateMood);
router.put('/:id', protect, editMoodEntry);
router.get('/insights', protect, getMoodInsights);

export default router;
