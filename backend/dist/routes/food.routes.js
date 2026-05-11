"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const food_controller_1 = require("../controllers/food.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
const foodImageUploadLimit = (0, rate_limit_middleware_1.createRateLimit)({
    keyPrefix: 'food_upload_image',
    windowMs: 60 * 1000,
    max: 12,
    message: 'Too many food image uploads. Please retry shortly.',
});
router.get('/', auth_middleware_1.authMiddleware, food_controller_1.getAllFoods);
router.get('/search', auth_middleware_1.authMiddleware, food_controller_1.searchFoods);
router.get('/categories', auth_middleware_1.authMiddleware, food_controller_1.getCategories);
router.get('/popular', auth_middleware_1.authMiddleware, food_controller_1.getPopularFoods);
router.get('/custom/mine', auth_middleware_1.authMiddleware, food_controller_1.getMyCustomFoods);
router.post('/custom', auth_middleware_1.authMiddleware, food_controller_1.createCustomFood);
router.post('/bootstrap-popular', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, food_controller_1.bootstrapPopularFoods);
router.post('/:id/upload-image', auth_middleware_1.authMiddleware, foodImageUploadLimit, upload_middleware_1.uploadMiddleware.single('image'), food_controller_1.uploadFoodImage);
router.get('/:id', auth_middleware_1.authMiddleware, food_controller_1.getFoodById);
exports.default = router;
