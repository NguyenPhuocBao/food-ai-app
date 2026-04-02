import { Router } from 'express';
import { 
  createSession, getSessions, getSession, deleteSession, 
  sendMessage, quickChat 
} from '../controllers/chatbot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/sessions', authMiddleware, createSession);
router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:id', authMiddleware, getSession);
router.delete('/sessions/:id', authMiddleware, deleteSession);
router.post('/sessions/:id/messages', authMiddleware, sendMessage);
router.post('/quick', authMiddleware, quickChat);

export default router;