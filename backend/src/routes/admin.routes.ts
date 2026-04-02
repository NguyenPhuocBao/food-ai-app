import { Router } from 'express';
import { 
  getAllUsers, getUserById, updateUserRole, deleteUser,
  getAllFoodsAdmin, createFood, updateFood, deleteFood,
  getSystemStats, getAuditLogs
} from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// User management
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.put('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Food management
router.get('/foods', authMiddleware, adminMiddleware, getAllFoodsAdmin);
router.post('/foods', authMiddleware, adminMiddleware, createFood);
router.put('/foods/:id', authMiddleware, adminMiddleware, updateFood);
router.delete('/foods/:id', authMiddleware, adminMiddleware, deleteFood);

// System
router.get('/statistics', authMiddleware, adminMiddleware, getSystemStats);
router.get('/audit-logs', authMiddleware, adminMiddleware, getAuditLogs);

export default router;