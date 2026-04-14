import { Router } from 'express';
import {
  getMealPlans,
  getActiveMealPlan,
  createMealPlan,
  addDetailToMealPlan,
  setActiveMealPlan,
  deleteMealPlan,
  generateAutoMealPlan,
  applyActiveMealPlanToday,
  getMealPlanShoppingList,
  toggleShoppingListItem,
  resetShoppingListChecks,
  getMealPlanInsights,
} from '../controllers/mealplan.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getMealPlans);
router.get('/active', authMiddleware, getActiveMealPlan);
router.post('/active/apply-today', authMiddleware, applyActiveMealPlanToday);
router.post('/', authMiddleware, createMealPlan);
router.post('/auto-generate', authMiddleware, generateAutoMealPlan);
router.post('/:id/details', authMiddleware, addDetailToMealPlan);
router.patch('/:id/activate', authMiddleware, setActiveMealPlan);
router.delete('/:id', authMiddleware, deleteMealPlan);
router.get('/:id/shopping-list', authMiddleware, getMealPlanShoppingList);
router.patch('/:id/shopping-list/check', authMiddleware, toggleShoppingListItem);
router.post('/:id/shopping-list/reset', authMiddleware, resetShoppingListChecks);
router.get('/:id/insights', authMiddleware, getMealPlanInsights);

export default router;
