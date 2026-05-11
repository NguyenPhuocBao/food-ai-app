import { Router } from 'express';
import { analyzeImage, confirmScanFood, getScanHistory } from '../controllers/analyze-image.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();
const analyzeUploadLimit = createRateLimit({
  keyPrefix: 'analyze_upload',
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many scan uploads. Please wait a moment and retry.',
});

router.post('/', authMiddleware, analyzeUploadLimit, uploadMiddleware.single('image'), analyzeImage);
router.post('/:scanId/confirm', authMiddleware, confirmScanFood);
router.get('/history', authMiddleware, getScanHistory);

export default router;
