import express from 'express';
import { getMessages, sendMessage, clearMessages } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/chat/:projectId/messages', protect, getMessages);
router.post('/chat/:projectId/messages', protect, sendMessage);
router.delete('/chat/:projectId/messages', protect, clearMessages);

export default router;
