import authService from './authService.js';
import postService from './postService.js';
import commentService from './commentService.js';
import moodService from './moodService.js';
import gratitudeService from './gratitudeService.js';
import challengeService from './challengeService.js';
import chatService from './chatService.js';
import notificationService from './notificationService.js';
import aiService from './aiService.js';
import adminService from './adminService.js';

export const api = {
  ...authService,
  ...postService,
  ...commentService,
  ...moodService,
  ...gratitudeService,
  ...challengeService,
  ...chatService,
  ...notificationService,
  ...aiService,
  ...adminService
};

export default api;
