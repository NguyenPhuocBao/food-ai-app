import { Router } from 'express';
import { 
  getAllFoods, 
  getFoodById, 
  searchFoods, 
  getCategories, 
  getPopularFoods, 
  uploadFoodImage,
  createCustomFood,
  getMyCustomFoods,
  bootstrapPopularFoods,
} from '../controllers/food.controller';
import { adminMiddleware, authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { createRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();
const foodImageUploadLimit = createRateLimit({
  keyPrefix: 'food_upload_image',
  windowMs: 60 * 1000,
  max: 12,
  message: 'Too many food image uploads. Please retry shortly.',
});

router.get('/', authMiddleware, getAllFoods);
router.get('/search', authMiddleware, searchFoods);
router.get('/categories', authMiddleware, getCategories);
router.get('/popular', authMiddleware, getPopularFoods);
router.get('/custom/mine', authMiddleware, getMyCustomFoods);
router.post('/custom', authMiddleware, createCustomFood);
router.post('/bootstrap-popular', authMiddleware, adminMiddleware, bootstrapPopularFoods);
router.post('/:id/upload-image', authMiddleware, foodImageUploadLimit, uploadMiddleware.single('image'), uploadFoodImage);
router.get('/:id', authMiddleware, getFoodById);

export default router;
