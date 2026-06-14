import express from 'express';
import { 
  getChatRooms, 
  getChatMessages, 
  sendChatMessage, 
  joinMatchQueue, 
  blockPeerRoom,
  getPeerRecommendations,
  invitePeerToChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getChatRooms);
router.get('/rooms/:roomId/messages', protect, getChatMessages);
router.post('/rooms/:roomId/messages', protect, sendChatMessage);

router.post('/match/join', protect, joinMatchQueue);
router.delete('/rooms/:roomId/block', protect, blockPeerRoom);

router.get('/match/recommendations', protect, getPeerRecommendations);
router.post('/match/invite', protect, invitePeerToChat);

export default router;
