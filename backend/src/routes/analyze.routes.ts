import { Router } from 'express';
import { analyzeImage, confirmScanFood } from '../controllers/analyze-image.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', authMiddleware, uploadMiddleware.single('image'), analyzeImage);
router.post('/:scanId/confirm', authMiddleware, confirmScanFood);
router.get('/history', authMiddleware, async (req: any, res) => {
  const scans = await prisma.scanHistory.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: scans });
});

export default router;
