"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const meal_controller_1 = require("../controllers/meal.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// User management
router.get('/users', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllUsers);
router.get('/users/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getUserById);
router.put('/users/:id/role', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateUserRole);
router.delete('/users/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteUser);
// Food management
router.get('/foods', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllFoodsAdmin);
router.post('/foods', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.createFood);
router.put('/foods/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateFood);
router.delete('/foods/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteFood);
// System
router.get('/statistics', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getSystemStats);
router.get('/audit-logs', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAuditLogs);
router.put('/users/:id/ban', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.toggleUserBan);
router.put('/users/:id/reset-password', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.resetUserPassword);
router.put('/users/:id/profile', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateUserProfileByAdmin);
// Recipe management
router.get('/recipes', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllRecipes);
router.delete('/recipes/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteRecipe);
// Review management
router.get('/reviews', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllReviews);
router.delete('/reviews/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteReview);
// Notification management
router.get('/notifications', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllNotifications);
router.delete('/notifications/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteNotification);
router.post('/notifications/broadcast', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.broadcastNotification);
router.post('/notifications/send-to-users', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.sendToUsers);
router.post('/notifications/send-to-user/:userId', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.sendNotificationToUser);
router.post('/notifications/send-to-multiple', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.sendNotificationToMultipleUsers);
router.post('/broadcast', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.broadcastNotification);
// Settings – nếu chưa có
router.get('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getAllSettings);
router.put('/settings', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateManySettings);
router.put('/recipes/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateRecipe);
router.post('/recipes', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.createRecipe);
router.get('/users/:userId/meal-plans', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.getUserMealPlans);
router.get('/meals/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, meal_controller_1.getMealById);
router.delete('/meals/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, meal_controller_1.deleteMeal);
router.post('/meal-plans', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.createMealPlan);
router.put('/meal-plans/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.updateMealPlan);
router.delete('/meal-plans/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, admin_controller_1.deleteMealPlan);
exports.default = router;
