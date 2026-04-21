import { Router } from 'express';
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getTrends,
  getNutritionOverview,
} from '../controllers/statistics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/daily', authMiddleware, getDailyStats);
router.get('/weekly', authMiddleware, getWeeklyStats);
router.get('/monthly', authMiddleware, getMonthlyStats);
router.get('/trends', authMiddleware, getTrends);
router.get('/overview', authMiddleware, getNutritionOverview);

export default router;
