import { Router } from 'express';
import { 
  register, login, logout, refreshToken, getMe, 
  updateProfile, changePassword, forgotPassword, resetPassword
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', authMiddleware, refreshToken);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;
