import { Router } from 'express';
import {
  getAllSettings,
  getAllSettingsRows,
  getSetting,
  updateSetting,
  updateManySettings,
  deleteSetting,
} from '../controllers/settings.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các route đều yêu cầu xác thực và quyền ADMIN
router.use(authMiddleware, adminMiddleware);

router.get('/', getAllSettings);
router.get('/rows', getAllSettingsRows);
router.post('/batch', updateManySettings);
router.put('/batch', updateManySettings);
router.get('/:key', getSetting);
router.put('/:key', updateSetting);
router.delete('/:key', deleteSetting);

export default router;
