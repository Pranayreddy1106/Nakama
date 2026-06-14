import express from 'express';
import { 
  getAllPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  toggleSupport, 
  toggleSavePost, 
  analyzePostAI, 
  reportPost 
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/support', protect, toggleSupport);
router.post('/:id/save', protect, toggleSavePost);
router.post('/:id/report', protect, reportPost);
router.post('/analyze-ai', protect, analyzePostAI);

export default router;
