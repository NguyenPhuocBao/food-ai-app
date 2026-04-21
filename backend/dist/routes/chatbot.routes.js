"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbot_controller_v2_1 = require("../controllers/chatbot.controller.v2");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const chat_upload_middleware_1 = require("../middlewares/chat-upload.middleware");
const router = (0, express_1.Router)();
const chatMessageLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'chat_message',
    windowMs: 60 * 1000,
    max: 40,
    message: 'Chat rate limit exceeded. Please slow down and try again.',
});
const quickChatLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'chat_quick',
    windowMs: 60 * 1000,
    max: 20,
    message: 'Quick chat limit reached. Please retry in a moment.',
});
router.get('/health', auth_middleware_1.authMiddleware, chatbot_controller_v2_1.healthCheck);
router.get('/training', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, chatbot_controller_v2_1.getTrainingData);
router.put('/training', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, chatbot_controller_v2_1.updateTrainingData);
router.post('/training/bootstrap-defaults', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, chatbot_controller_v2_1.bootstrapDefaultTrainingData);
router.post('/training/benchmark', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, chatbot_controller_v2_1.benchmarkTrainingData);
router.post('/sessions', auth_middleware_1.authMiddleware, chatbot_controller_v2_1.createSession);
router.get('/sessions', auth_middleware_1.authMiddleware, chatbot_controller_v2_1.getSessions);
router.get('/sessions/:id', auth_middleware_1.authMiddleware, chatbot_controller_v2_1.getSession);
router.delete('/sessions/:id', auth_middleware_1.authMiddleware, chatbot_controller_v2_1.deleteSession);
router.post('/sessions/:id/messages', auth_middleware_1.authMiddleware, chatMessageLimit, chat_upload_middleware_1.chatUploadMiddleware.array('files', 5), chatbot_controller_v2_1.sendMessage);
router.post('/quick', auth_middleware_1.authMiddleware, quickChatLimit, chat_upload_middleware_1.chatUploadMiddleware.array('files', 5), chatbot_controller_v2_1.quickChat);
exports.default = router;
