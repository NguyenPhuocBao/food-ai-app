"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyze_image_controller_1 = require("../controllers/analyze-image.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
const analyzeUploadLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'analyze_upload',
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many scan uploads. Please wait a moment and retry.',
});
router.post('/', auth_middleware_1.authMiddleware, analyzeUploadLimit, upload_middleware_1.uploadMiddleware.single('image'), analyze_image_controller_1.analyzeImage);
router.post('/:scanId/confirm', auth_middleware_1.authMiddleware, analyze_image_controller_1.confirmScanFood);
router.get('/history', auth_middleware_1.authMiddleware, analyze_image_controller_1.getScanHistory);
exports.default = router;
