import { Router } from 'express';
import { 
  getAllUsers, getUserById, updateUserRole, deleteUser,
  getAllFoodsAdmin, createFood, updateFood, deleteFood,
  getSystemStats, getAuditLogs,
  updateUserProfileByAdmin,
  resetUserPassword,
  toggleUserBan, broadcastNotification, 
  getAllRecipes, deleteRecipe, getAllReviews, deleteReview, 
  getAllNotifications, deleteNotification, getAllSettings, updateManySettings,
  createRecipe, updateRecipe, getUserMealPlans, createMealPlan, updateMealPlan, deleteMealPlan,
  sendToUsers,
  sendNotificationToMultipleUsers,
  sendNotificationToUser
} from '../controllers/admin.controller';
import {
  createDbTableRow,
  deleteDbTableRow,
  executeDbSelectQuery,
  getDbTableRows,
  getDbTableSchema,
  getDbTables,
  updateDbTableRow,
} from '../controllers/admin-db.controller';
import { deleteMeal, getMealById } from '../controllers/meal.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';


const router = Router();

// User management
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.put('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Food management
router.get('/foods', authMiddleware, adminMiddleware, getAllFoodsAdmin);
router.post('/foods', authMiddleware, adminMiddleware, createFood);
router.put('/foods/:id', authMiddleware, adminMiddleware, updateFood);
router.delete('/foods/:id', authMiddleware, adminMiddleware, deleteFood);

// System
router.get('/statistics', authMiddleware, adminMiddleware, getSystemStats);
router.get('/audit-logs', authMiddleware, adminMiddleware, getAuditLogs);
router.get('/db/tables', authMiddleware, adminMiddleware, getDbTables);
router.get('/db/tables/:table/schema', authMiddleware, adminMiddleware, getDbTableSchema);
router.get('/db/tables/:table/rows', authMiddleware, adminMiddleware, getDbTableRows);
router.post('/db/tables/:table/rows', authMiddleware, adminMiddleware, createDbTableRow);
router.put('/db/tables/:table/rows/:rowId', authMiddleware, adminMiddleware, updateDbTableRow);
router.delete('/db/tables/:table/rows/:rowId', authMiddleware, adminMiddleware, deleteDbTableRow);
router.post('/db/query', authMiddleware, adminMiddleware, executeDbSelectQuery);

router.put('/users/:id/ban', authMiddleware, adminMiddleware, toggleUserBan);
router.put('/users/:id/reset-password', authMiddleware, adminMiddleware, resetUserPassword);
router.put('/users/:id/profile', authMiddleware, adminMiddleware, updateUserProfileByAdmin);

// Recipe management
router.get('/recipes', authMiddleware, adminMiddleware, getAllRecipes);
router.delete('/recipes/:id', authMiddleware, adminMiddleware, deleteRecipe);

// Review management
router.get('/reviews', authMiddleware, adminMiddleware, getAllReviews);
router.delete('/reviews/:id', authMiddleware, adminMiddleware, deleteReview);

// Notification management
router.get('/notifications', authMiddleware, adminMiddleware, getAllNotifications);
router.delete('/notifications/:id', authMiddleware, adminMiddleware, deleteNotification);
router.post('/notifications/broadcast', authMiddleware, adminMiddleware, broadcastNotification);
router.post('/notifications/send-to-users', authMiddleware, adminMiddleware, sendToUsers);
router.post('/notifications/send-to-user/:userId', authMiddleware, adminMiddleware, sendNotificationToUser);
router.post('/notifications/send-to-multiple', authMiddleware, adminMiddleware, sendNotificationToMultipleUsers);
router.post('/broadcast', authMiddleware, adminMiddleware, broadcastNotification);

// Settings – nếu chưa có
router.get('/settings', authMiddleware, adminMiddleware, getAllSettings);
router.put('/settings', authMiddleware, adminMiddleware, updateManySettings);

router.put('/recipes/:id', authMiddleware, adminMiddleware, updateRecipe);
router.post('/recipes', authMiddleware, adminMiddleware, createRecipe);

router.get('/users/:userId/meal-plans', authMiddleware, adminMiddleware, getUserMealPlans);
router.get('/meals/:id', authMiddleware, adminMiddleware, getMealById);
router.delete('/meals/:id', authMiddleware, adminMiddleware, deleteMeal);
router.post('/meal-plans', authMiddleware, adminMiddleware, createMealPlan);
router.put('/meal-plans/:id', authMiddleware, adminMiddleware, updateMealPlan);
router.delete('/meal-plans/:id', authMiddleware, adminMiddleware, deleteMealPlan);

export default router;
