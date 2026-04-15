import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getDailyHealth,
  getHydrationToday,
  getMealHealth,
  getPersonalization,
  getWeeklyActions,
  getWeeklyHealth,
  logHydration,
  updateRoutine,
} from '../controllers/health.controller';

const router = Router();

router.get('/meal/:id', authMiddleware, getMealHealth);
router.get('/daily', authMiddleware, getDailyHealth);
router.get('/weekly', authMiddleware, getWeeklyHealth);

router.get('/personalization', authMiddleware, getPersonalization);
router.put('/personalization/routine', authMiddleware, updateRoutine);

router.get('/hydration/today', authMiddleware, getHydrationToday);
router.post('/hydration/log', authMiddleware, logHydration);

router.get('/weekly-actions', authMiddleware, getWeeklyActions);

export default router;
