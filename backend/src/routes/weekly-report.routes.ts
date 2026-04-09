import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  deleteWeeklyReport,
  generateWeeklyReport,
  getLatestWeeklyReport,
  getWeeklyReports,
} from '../controllers/weekly-report.controller';

const router = Router();

router.get('/', authMiddleware, getWeeklyReports);
router.get('/latest', authMiddleware, getLatestWeeklyReport);
router.post('/generate', authMiddleware, generateWeeklyReport);
router.delete('/:id', authMiddleware, deleteWeeklyReport);

export default router;

