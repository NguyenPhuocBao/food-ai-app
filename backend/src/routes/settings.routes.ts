import { Router } from 'express';
import { getAllSettings, getSetting, updateSetting, updateManySettings } from '../controllers/settings.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các route đều yêu cầu xác thực và quyền ADMIN
router.use(authMiddleware, adminMiddleware);

router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key', updateSetting);
router.post('/batch', updateManySettings);

export default router;