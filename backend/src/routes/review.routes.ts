import { Router } from 'express';
import { 
  addReview, getReviews, updateReview, deleteReview, markHelpful 
} from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/foods/:foodId', authMiddleware, addReview);
router.get('/foods/:foodId', getReviews);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/helpful', authMiddleware, markHelpful);

export default router;