"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
const authBurstLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'auth',
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many authentication attempts. Please wait a few minutes.',
});
const loginLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'auth_login',
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts. Please try again later.',
});
const passwordResetLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'auth_password_reset',
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: 'Too many password reset requests. Please try again later.',
});
router.post('/register', authBurstLimit, auth_controller_1.register);
router.post('/login', loginLimit, auth_controller_1.login);
router.post('/forgot-password', passwordResetLimit, auth_controller_1.forgotPassword);
router.post('/reset-password', passwordResetLimit, auth_controller_1.resetPassword);
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.logout);
router.post('/refresh-token', auth_middleware_1.authMiddleware, auth_controller_1.refreshToken);
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.getMe);
router.put('/profile', auth_middleware_1.authMiddleware, auth_controller_1.updateProfile);
router.put('/change-password', auth_middleware_1.authMiddleware, auth_controller_1.changePassword);
exports.default = router;
