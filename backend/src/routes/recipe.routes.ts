import { Router } from 'express';
import { 
  getPopularRecipes, getRecentRecipes, searchRecipes, 
  getRecipesByDifficulty, getRecipesByTime, saveRecipe, 
  unsaveRecipe, getSavedRecipes, markAsCooked 
} from '../controllers/recipe.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/popular', getPopularRecipes);
router.get('/recent', getRecentRecipes);
router.get('/search', searchRecipes);
router.get('/by-difficulty/:difficulty', getRecipesByDifficulty);
router.get('/by-time', getRecipesByTime);
router.post('/:id/save', authMiddleware, saveRecipe);
router.delete('/:id/save', authMiddleware, unsaveRecipe);
router.get('/saved', authMiddleware, getSavedRecipes);
router.post('/:id/cook', authMiddleware, markAsCooked);

export default router;