"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const support_controller_1 = require("../controllers/support.controller");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
const supportSessionLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'support_create_session',
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many support session requests. Please try again later.',
});
const supportMessageLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'support_message',
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many support messages. Please wait a moment.',
});
router.get('/sessions', auth_middleware_1.authMiddleware, support_controller_1.getSupportSessions);
router.post('/sessions', auth_middleware_1.authMiddleware, supportSessionLimit, support_controller_1.createSupportSession);
router.get('/sessions/:id', auth_middleware_1.authMiddleware, support_controller_1.getSupportSession);
router.post('/sessions/:id/messages', auth_middleware_1.authMiddleware, supportMessageLimit, support_controller_1.sendSupportMessage);
router.put('/sessions/:id/status', auth_middleware_1.authMiddleware, support_controller_1.updateSupportSessionStatus);
exports.default = router;
