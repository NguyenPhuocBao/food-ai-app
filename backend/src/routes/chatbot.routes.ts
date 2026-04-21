import { Router } from 'express';
import { 
  createSession, getSessions, getSession, deleteSession,
  healthCheck,
  getTrainingData, updateTrainingData, bootstrapDefaultTrainingData, benchmarkTrainingData,
  sendMessage, quickChat 
} from '../controllers/chatbot.controller.v2';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';
import { createRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();
const chatMessageLimit = createRateLimit({
  keyPrefix: 'chat_message',
  windowMs: 60 * 1000,
  max: 40,
  message: 'Chat rate limit exceeded. Please slow down and try again.',
});
const quickChatLimit = createRateLimit({
  keyPrefix: 'chat_quick',
  windowMs: 60 * 1000,
  max: 20,
  message: 'Quick chat limit reached. Please retry in a moment.',
});

router.get('/health', authMiddleware, healthCheck);
router.get('/training', authMiddleware, adminMiddleware, getTrainingData);
router.put('/training', authMiddleware, adminMiddleware, updateTrainingData);
router.post('/training/bootstrap-defaults', authMiddleware, adminMiddleware, bootstrapDefaultTrainingData);
router.post('/training/benchmark', authMiddleware, adminMiddleware, benchmarkTrainingData);
router.post('/sessions', authMiddleware, createSession);
router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:id', authMiddleware, getSession);
router.delete('/sessions/:id', authMiddleware, deleteSession);
router.post('/sessions/:id/messages', authMiddleware, chatMessageLimit, sendMessage);
router.post('/quick', authMiddleware, quickChatLimit, quickChat);

export default router;
