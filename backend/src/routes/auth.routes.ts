import { Router } from 'express';
import { 
  register, login, logout, refreshToken, getMe, 
  updateProfile, changePassword, forgotPassword, resetPassword
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createRateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();
const authBurstLimit = createRateLimit({
  keyPrefix: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please wait a few minutes.',
});
const loginLimit = createRateLimit({
  keyPrefix: 'auth_login',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.',
});
const passwordResetLimit = createRateLimit({
  keyPrefix: 'auth_password_reset',
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many password reset requests. Please try again later.',
});

router.post('/register', authBurstLimit, register);
router.post('/login', loginLimit, login);
router.post('/forgot-password', passwordResetLimit, forgotPassword);
router.post('/reset-password', passwordResetLimit, resetPassword);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', authMiddleware, refreshToken);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;
