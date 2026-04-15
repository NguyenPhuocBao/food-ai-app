import { Router } from 'express';
import { 
  createSession, getSessions, getSession, deleteSession,
  healthCheck,
  getTrainingData, updateTrainingData, bootstrapDefaultTrainingData, benchmarkTrainingData,
  sendMessage, quickChat 
} from '../controllers/chatbot.controller.v2';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/health', authMiddleware, healthCheck);
router.get('/training', authMiddleware, adminMiddleware, getTrainingData);
router.put('/training', authMiddleware, adminMiddleware, updateTrainingData);
router.post('/training/bootstrap-defaults', authMiddleware, adminMiddleware, bootstrapDefaultTrainingData);
router.post('/training/benchmark', authMiddleware, adminMiddleware, benchmarkTrainingData);
router.post('/sessions', authMiddleware, createSession);
router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:id', authMiddleware, getSession);
router.delete('/sessions/:id', authMiddleware, deleteSession);
router.post('/sessions/:id/messages', authMiddleware, sendMessage);
router.post('/quick', authMiddleware, quickChat);

export default router;
