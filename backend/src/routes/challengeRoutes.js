import express from 'express';
import { 
  getChallenges, 
  joinChallenge, 
  updateChallengeProgress 
} from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getChallenges);
router.post('/join', protect, joinChallenge);
router.put('/:id/progress', protect, updateChallengeProgress);

export default router;
