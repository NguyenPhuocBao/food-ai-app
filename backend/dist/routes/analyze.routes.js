"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyze_image_controller_1 = require("../controllers/analyze-image.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, upload_middleware_1.uploadMiddleware.single('image'), analyze_image_controller_1.analyzeImage);
router.post('/:scanId/confirm', auth_middleware_1.authMiddleware, analyze_image_controller_1.confirmScanFood);
router.get('/history', auth_middleware_1.authMiddleware, async (req, res) => {
    const scans = await prisma_1.prisma.scanHistory.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: scans });
});
exports.default = router;
