import { Router } from 'express';
import { 
  getAllFoods, 
  getFoodById, 
  searchFoods, 
  getCategories, 
  getPopularFoods 
} from '../controllers/food.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAllFoods);
router.get('/search', authMiddleware, searchFoods);
router.get('/categories', authMiddleware, getCategories);
router.get('/popular', authMiddleware, getPopularFoods);
router.get('/:id', authMiddleware, getFoodById);

export default router;