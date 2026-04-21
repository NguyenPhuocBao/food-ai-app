import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createSupportSession,
  getSupportSession,
  getSupportSessions,
  sendSupportMessage,
  updateSupportSessionStatus,
} from '../controllers/support.controller';
import { createRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();
const supportSessionLimit = createRateLimit({
  keyPrefix: 'support_create_session',
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Too many support session requests. Please try again later.',
});
const supportMessageLimit = createRateLimit({
  keyPrefix: 'support_message',
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many support messages. Please wait a moment.',
});

router.get('/sessions', authMiddleware, getSupportSessions);
router.post('/sessions', authMiddleware, supportSessionLimit, createSupportSession);
router.get('/sessions/:id', authMiddleware, getSupportSession);
router.post('/sessions/:id/messages', authMiddleware, supportMessageLimit, sendSupportMessage);
router.put('/sessions/:id/status', authMiddleware, updateSupportSessionStatus);

export default router;
