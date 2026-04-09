import { Router } from 'express';
import { 
  addMeal, getMealById, getMealsByDate, getMealHistory, updateMeal, deleteMeal 
} from '../controllers/meal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, addMeal);
router.get('/', authMiddleware, getMealsByDate);
router.get('/history', authMiddleware, getMealHistory);
router.get('/:id', authMiddleware, getMealById);
router.put('/:id', authMiddleware, updateMeal);
router.delete('/:id', authMiddleware, deleteMeal);

export default router;
