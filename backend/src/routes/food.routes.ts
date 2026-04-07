import { Router } from 'express';
import { 
  getAllFoods, 
  getFoodById, 
  searchFoods, 
  getCategories, 
  getPopularFoods, 
  uploadFoodImage
} from '../controllers/food.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', authMiddleware, getAllFoods);
router.get('/search', authMiddleware, searchFoods);
router.get('/categories', authMiddleware, getCategories);
router.get('/popular', authMiddleware, getPopularFoods);
router.post('/:id/upload-image', authMiddleware, uploadMiddleware.single('image'), uploadFoodImage);
router.get('/:id', authMiddleware, getFoodById);

export default router;