"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Tất cả các route đều yêu cầu xác thực và quyền ADMIN
router.use(auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware);
router.get('/', settings_controller_1.getAllSettings);
router.get('/:key', settings_controller_1.getSetting);
router.put('/:key', settings_controller_1.updateSetting);
router.post('/batch', settings_controller_1.updateManySettings);
exports.default = router;
