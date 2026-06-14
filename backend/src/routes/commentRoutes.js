import express from 'express';
import { 
  getCommentsByPost, 
  createComment, 
  replyToComment, 
  deleteComment 
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', protect, createComment);
router.post('/:commentId/reply', protect, replyToComment);
router.delete('/:id', protect, deleteComment);

export default router;
