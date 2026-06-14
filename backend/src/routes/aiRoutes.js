import express from 'express';
import { askCompanion } from '../controllers/aiCompanionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/companion', protect, askCompanion);

export default router;
