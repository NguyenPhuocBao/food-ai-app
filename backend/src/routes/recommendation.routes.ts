import { Router } from 'express';
import {
  generateRecommendations,
  generateRecommendationsByMealPlan,
  getRecommendations,
  markRecommendationViewed,
  applyRecommendationToMealPlanDays,
  respondToRecommendation,
} from '../controllers/recommendation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getRecommendations);
router.post('/generate', authMiddleware, generateRecommendations);
router.post('/generate-by-meal-plan', authMiddleware, generateRecommendationsByMealPlan);
router.post('/apply-to-meal-plan-days', authMiddleware, applyRecommendationToMealPlanDays);
router.put('/:id/viewed', authMiddleware, markRecommendationViewed);
router.put('/:id/respond', authMiddleware, respondToRecommendation);

export default router;
