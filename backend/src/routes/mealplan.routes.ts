import { Router } from 'express';
import {
  getMealPlans,
  getActiveMealPlan,
  createMealPlan,
  addDetailToMealPlan,
  setActiveMealPlan,
  deleteMealPlan,
} from '../controllers/mealplan.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMealPlans);
router.get('/active', authMiddleware, getActiveMealPlan);
router.post('/', authMiddleware, createMealPlan);
router.post('/:id/details', authMiddleware, addDetailToMealPlan);
router.patch('/:id/activate', authMiddleware, setActiveMealPlan);
router.delete('/:id', authMiddleware, deleteMealPlan);

export default router;
