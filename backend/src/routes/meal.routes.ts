import { Router } from 'express';
import { 
  addMeal, getMealsByDate, getMealHistory, updateMeal, deleteMeal 
} from '../controllers/meal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, addMeal);
router.get('/', authMiddleware, getMealsByDate);
router.get('/history', authMiddleware, getMealHistory);
router.put('/:id', authMiddleware, updateMeal);
router.delete('/:id', authMiddleware, deleteMeal);

export default router;