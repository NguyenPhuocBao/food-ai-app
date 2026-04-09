import { Router } from 'express';
import {
  generateRecommendations,
  getRecommendations,
  markRecommendationViewed,
  respondToRecommendation,
} from '../controllers/recommendation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getRecommendations);
router.post('/generate', authMiddleware, generateRecommendations);
router.put('/:id/viewed', authMiddleware, markRecommendationViewed);
router.put('/:id/respond', authMiddleware, respondToRecommendation);

export default router;

