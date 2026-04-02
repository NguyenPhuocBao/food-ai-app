import { Router } from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favorite.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/foods/:foodId', authMiddleware, addFavorite);
router.delete('/foods/:foodId', authMiddleware, removeFavorite);
router.get('/foods', authMiddleware, getFavorites);

export default router;