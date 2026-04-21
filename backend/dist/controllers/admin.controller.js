"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotification = exports.sendNotificationToMultipleUsers = exports.sendNotificationToUser = exports.sendToUsers = exports.deleteMealPlan = exports.updateMealPlan = exports.createMealPlan = exports.getUserMealPlans = exports.createRecipe = exports.updateRecipe = exports.updateManySettings = exports.getAllSettings = exports.deleteNotification = exports.getAllNotifications = exports.deleteReview = exports.getAllReviews = exports.deleteRecipe = exports.getAllRecipes = exports.updateUserProfileByAdmin = exports.resetUserPassword = exports.toggleUserBan = exports.getAuditLogs = exports.getSystemStats = exports.deleteFood = exports.updateFood = exports.createFood = exports.getAllFoodsAdmin = exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const active_user_service_1 = require("../services/active-user.service");
const timezone_util_1 = require("../utils/timezone.util");
const prisma = new client_1.PrismaClient();
const toLocalDateKey = (date) => (0, timezone_util_1.toAppDateKey)(date);
const SUPPORT_PREFIX = 'SUPPORT_';
const SUPPORT_STATUS_OPEN = 'SUPPORT_OPEN';
const SUPPORT_STATUS_PENDING = 'SUPPORT_PENDING';
const SUPPORT_STATUS_CLOSED = 'SUPPORT_CLOSED';
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const activeUserIds = await (0, active_user_service_1.getActiveUserIds)();
        const activeUserSet = new Set(activeUserIds);
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const users = await prisma.user.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { profile: true, _count: { select: { meals: true, scanHistory: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const total = await prisma.user.count({ where });
        const usersWithActivity = users.map((user) => ({
            ...user,
            isOnline: user.isActive && activeUserSet.has(user.id),
        }));
        res.json({
            success: true,
            data: usersWithActivity,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
            meta: {
                activeProvider: (0, active_user_service_1.getActiveProvider)(),
                activeWindowMinutes: (0, active_user_service_1.getActiveWindowMinutes)(),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id);
        const user = await prisma.user.findUnique({
            where: { id: parsedId },
            include: {
                profile: true,
                goals: true,
                meals: { take: 10, orderBy: { eatenAt: 'desc' } },
                scanHistory: { take: 10, orderBy: { createdAt: 'desc' } },
                _count: { select: { meals: true, scanHistory: true, favorites: true, reviews: true } },
            },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const activeUserSet = new Set(await (0, active_user_service_1.getActiveUserIds)());
        res.json({
            success: true,
            data: {
                ...user,
                isOnline: user.isActive && activeUserSet.has(parsedId),
            },
            meta: {
                activeProvider: (0, active_user_service_1.getActiveProvider)(),
                activeWindowMinutes: (0, active_user_service_1.getActiveWindowMinutes)(),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserById = getUserById;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!Object.values(client_1.Role).includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role: role },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_ROLE',
                entity: 'User',
                entityId: user.id,
                newData: { role },
            },
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        await prisma.user.delete({ where: { id: parseInt(id) } });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE_USER',
                entity: 'User',
                entityId: parseInt(id),
                oldData: { email: user.email },
            },
        });
        res.json({ success: true, message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteUser = deleteUser;
// Foods admin (giống food controller nhưng không cần auth)
const getAllFoodsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const where = {};
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        const foods = await prisma.foodItem.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { recipe: true, _count: { select: { meals: true, favorites: true, reviews: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const total = await prisma.foodItem.count({ where });
        res.json({
            success: true,
            data: foods,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllFoodsAdmin = getAllFoodsAdmin;
const createFood = async (req, res) => {
    try {
        const { name, category, description, calories, protein, fat, carbs, isVegetarian, isVegan, isGlutenFree } = req.body;
        if (!name || !category || !calories)
            return res.status(400).json({ error: 'Missing required fields' });
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[đĐ]/g, 'd');
        const food = await prisma.foodItem.create({
            data: {
                name,
                slug,
                category,
                description,
                calories: parseInt(calories),
                protein: parseFloat(protein) || 0,
                fat: parseFloat(fat) || 0,
                carbs: parseFloat(carbs) || 0,
                isVegetarian: isVegetarian || false,
                isVegan: isVegan || false,
                isGlutenFree: isGlutenFree || false,
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'CREATE_FOOD',
                entity: 'FoodItem',
                entityId: food.id,
                newData: { name, category },
            },
        });
        res.json({ success: true, data: food });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createFood = createFood;
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, calories, protein, fat, carbs, isVegetarian, isVegan, isGlutenFree } = req.body;
        const oldFood = await prisma.foodItem.findUnique({ where: { id: parseInt(id) } });
        if (!oldFood)
            return res.status(404).json({ error: 'Food not found' });
        const slug = name ? name.toLowerCase().replace(/ /g, '-').replace(/[đĐ]/g, 'd') : undefined;
        const food = await prisma.foodItem.update({
            where: { id: parseInt(id) },
            data: {
                name,
                slug,
                category,
                description,
                calories: calories ? parseInt(calories) : undefined,
                protein: protein ? parseFloat(protein) : undefined,
                fat: fat ? parseFloat(fat) : undefined,
                carbs: carbs ? parseFloat(carbs) : undefined,
                isVegetarian,
                isVegan,
                isGlutenFree,
            },
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_FOOD',
                entity: 'FoodItem',
                entityId: food.id,
                oldData: { name: oldFood.name },
                newData: { name: food.name },
            },
        });
        res.json({ success: true, data: food });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateFood = updateFood;
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await prisma.foodItem.findUnique({ where: { id: parseInt(id) } });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        await prisma.foodItem.delete({ where: { id: parseInt(id) } });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE_FOOD',
                entity: 'FoodItem',
                entityId: parseInt(id),
                oldData: { name: food.name },
            },
        });
        res.json({ success: true, message: 'Food deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteFood = deleteFood;
const getSystemStats = async (req, res) => {
    try {
        const startOfToday = (0, timezone_util_1.toAppDayStart)(new Date());
        const startOfWindow = (0, timezone_util_1.shiftAppDays)(startOfToday, -6);
        const supportFirstResponseWindowStart = (0, timezone_util_1.shiftAppDays)(startOfToday, -30);
        const supportPendingThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000));
        const activeUserIds = await (0, active_user_service_1.getActiveUserIds)();
        const activeUserSet = new Set(activeUserIds);
        const [totalUsers, newUsersThisWeek, totalFoods, totalRecipes, totalMeals, mealsToday, totalScans, scansToday, confirmedScans, totalReviews, totalFavorites, totalMealPlans, activeMealPlans, topCategories, popularFoods, recentUsers, recentMeals, recentScans, recentFavorites, recentUserSignups, activeUsers, supportSessionStatusCounts, supportSessionsToday, supportPendingOver24h, supportMessagesTotal, supportSessionsForFirstResponse,] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: startOfWindow } } }),
            prisma.foodItem.count(),
            prisma.recipe.count(),
            prisma.meal.count(),
            prisma.meal.count({ where: { eatenAt: { gte: startOfToday } } }),
            prisma.scanHistory.count(),
            prisma.scanHistory.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.scanHistory.count({ where: { isConfirmed: true } }),
            prisma.review.count(),
            prisma.favorite.count(),
            prisma.mealPlan.count(),
            prisma.mealPlan.count({ where: { isActive: true } }),
            prisma.foodItem.groupBy({
                by: ['category'],
                _count: { category: true },
                orderBy: { _count: { category: 'desc' } },
                take: 6,
            }),
            prisma.foodItem.findMany({
                orderBy: [{ popularity: 'desc' }, { updatedAt: 'desc' }],
                take: 6,
                include: {
                    recipe: { select: { id: true, title: true } },
                    _count: { select: { favorites: true, reviews: true, meals: true } },
                },
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    profile: true,
                    _count: { select: { meals: true, scanHistory: true, favorites: true, mealPlans: true } },
                },
            }),
            prisma.meal.findMany({
                where: { eatenAt: { gte: startOfWindow } },
                select: { eatenAt: true, calories: true },
            }),
            prisma.scanHistory.findMany({
                where: { createdAt: { gte: startOfWindow } },
                select: { createdAt: true, isConfirmed: true },
            }),
            prisma.favorite.findMany({
                where: { createdAt: { gte: startOfWindow } },
                select: { createdAt: true },
            }),
            prisma.user.findMany({
                where: { createdAt: { gte: startOfWindow } },
                select: { createdAt: true },
            }),
            activeUserIds.length > 0
                ? prisma.user.count({
                    where: {
                        id: { in: activeUserIds },
                        isActive: true,
                    },
                })
                : Promise.resolve(0),
            prisma.chatSession.groupBy({
                by: ['status'],
                where: {
                    status: { startsWith: SUPPORT_PREFIX },
                },
                _count: { status: true },
            }),
            prisma.chatSession.count({
                where: {
                    status: { startsWith: SUPPORT_PREFIX },
                    createdAt: { gte: startOfToday },
                },
            }),
            prisma.chatSession.count({
                where: {
                    status: SUPPORT_STATUS_PENDING,
                    updatedAt: { lte: supportPendingThreshold },
                },
            }),
            prisma.chatMessage.count({
                where: {
                    session: {
                        status: { startsWith: SUPPORT_PREFIX },
                    },
                },
            }),
            prisma.chatSession.findMany({
                where: {
                    status: { startsWith: SUPPORT_PREFIX },
                    createdAt: { gte: supportFirstResponseWindowStart },
                },
                select: {
                    id: true,
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        select: { role: true, createdAt: true },
                    },
                },
            }),
        ]);
        const supportStatusMap = supportSessionStatusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {});
        let supportFirstResponseSamples30d = 0;
        let supportFirstResponseTotalMinutes30d = 0;
        supportSessionsForFirstResponse.forEach((session) => {
            const firstUserMessage = session.messages.find((message) => message.role === 'USER');
            if (!firstUserMessage)
                return;
            const firstAdminReply = session.messages.find((message) => message.role === 'ADMIN' &&
                message.createdAt.getTime() >= firstUserMessage.createdAt.getTime());
            if (!firstAdminReply)
                return;
            const diffMinutes = (firstAdminReply.createdAt.getTime() - firstUserMessage.createdAt.getTime()) / 60000;
            supportFirstResponseTotalMinutes30d += Math.max(0, diffMinutes);
            supportFirstResponseSamples30d += 1;
        });
        const avgFirstResponseMinutes30d = supportFirstResponseSamples30d > 0
            ? Math.round((supportFirstResponseTotalMinutes30d / supportFirstResponseSamples30d) * 10) / 10
            : null;
        const dailyMap = new Map();
        for (let offset = 0; offset < 7; offset += 1) {
            const current = (0, timezone_util_1.shiftAppDays)(startOfWindow, offset);
            const key = toLocalDateKey(current);
            dailyMap.set(key, {
                date: key,
                meals: 0,
                calories: 0,
                scans: 0,
                confirmedScans: 0,
                saves: 0,
                newUsers: 0,
            });
        }
        recentMeals.forEach((meal) => {
            const key = toLocalDateKey(meal.eatenAt);
            const bucket = dailyMap.get(key);
            if (!bucket)
                return;
            bucket.meals += 1;
            bucket.calories += meal.calories;
        });
        recentScans.forEach((scan) => {
            const key = toLocalDateKey(scan.createdAt);
            const bucket = dailyMap.get(key);
            if (!bucket)
                return;
            bucket.scans += 1;
            if (scan.isConfirmed)
                bucket.confirmedScans += 1;
        });
        recentFavorites.forEach((favorite) => {
            const key = toLocalDateKey(favorite.createdAt);
            const bucket = dailyMap.get(key);
            if (!bucket)
                return;
            bucket.saves += 1;
        });
        recentUserSignups.forEach((user) => {
            const key = toLocalDateKey(user.createdAt);
            const bucket = dailyMap.get(key);
            if (!bucket)
                return;
            bucket.newUsers += 1;
        });
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    newThisWeek: newUsersThisWeek,
                },
                foods: {
                    total: totalFoods,
                    withRecipes: totalRecipes,
                },
                recipes: {
                    total: totalRecipes,
                },
                meals: {
                    total: totalMeals,
                    today: mealsToday,
                },
                scans: {
                    total: totalScans,
                    today: scansToday,
                    confirmed: confirmedScans,
                },
                library: {
                    favorites: totalFavorites,
                    reviews: totalReviews,
                },
                mealPlans: {
                    total: totalMealPlans,
                    active: activeMealPlans,
                },
                support: {
                    totalSessions: (supportStatusMap[SUPPORT_STATUS_OPEN] || 0) +
                        (supportStatusMap[SUPPORT_STATUS_PENDING] || 0) +
                        (supportStatusMap[SUPPORT_STATUS_CLOSED] || 0),
                    open: supportStatusMap[SUPPORT_STATUS_OPEN] || 0,
                    pending: supportStatusMap[SUPPORT_STATUS_PENDING] || 0,
                    closed: supportStatusMap[SUPPORT_STATUS_CLOSED] || 0,
                    today: supportSessionsToday,
                    pendingOver24h: supportPendingOver24h,
                    totalMessages: supportMessagesTotal,
                    avgFirstResponseMinutes30d,
                    firstResponseSamples30d: supportFirstResponseSamples30d,
                },
                topCategories: topCategories.map((item) => ({
                    name: item.category,
                    value: item._count.category,
                })),
                popularFoods,
                recentUsers: recentUsers.map((user) => ({
                    ...user,
                    isOnline: user.isActive && activeUserSet.has(user.id),
                })),
                weeklyOverview: Array.from(dailyMap.values()),
                activeProvider: (0, active_user_service_1.getActiveProvider)(),
                activeWindowMinutes: (0, active_user_service_1.getActiveWindowMinutes)(),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSystemStats = getSystemStats;
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, entity, search } = req.query;
        const where = {};
        if (action)
            where.action = action;
        if (entity)
            where.entity = entity;
        const keyword = String(search || '').trim();
        if (keyword) {
            const relationSearch = {
                user: {
                    is: {
                        OR: [
                            { name: { contains: keyword, mode: 'insensitive' } },
                            { email: { contains: keyword, mode: 'insensitive' } },
                        ],
                    },
                },
            };
            const numericKeyword = Number.parseInt(keyword, 10);
            where.OR = [
                { action: { contains: keyword, mode: 'insensitive' } },
                { entity: { contains: keyword, mode: 'insensitive' } },
                { ipAddress: { contains: keyword, mode: 'insensitive' } },
                { userAgent: { contains: keyword, mode: 'insensitive' } },
                relationSearch,
                ...(Number.isInteger(numericKeyword) ? [{ entityId: numericKeyword }] : []),
            ];
        }
        const logs = await prisma.auditLog.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const total = await prisma.auditLog.count({ where });
        res.json({
            success: true,
            data: logs,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAuditLogs = getAuditLogs;
const toggleUserBan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isActive: !user.isActive }
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'TOGGLE_BAN',
                entity: 'User',
                entityId: updated.id,
                newData: { isActive: updated.isActive }
            }
        });
        res.json({ success: true, data: { isActive: updated.isActive } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.toggleUserBan = toggleUserBan;
// Reset user password về mật khẩu mặc định (ví dụ "123456")
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const defaultPassword = '123456';
        const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
        const now = new Date();
        const parsedUserId = parseInt(id);
        const user = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: parsedUserId },
                data: { password: hashedPassword, passwordChangedAt: now }
            });
            await tx.passwordResetToken.deleteMany({
                where: { userId: parsedUserId, usedAt: null }
            });
            return updatedUser;
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'RESET_PASSWORD',
                entity: 'User',
                entityId: user.id
            }
        });
        res.json({ success: true, message: 'Password reset to 123456' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.resetUserPassword = resetUserPassword;
// Cập nhật profile của user (chỉ số sức khỏe)
const updateUserProfileByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { height, weight, targetCalories, targetProtein, targetFat, targetCarbs, allergies } = req.body;
        const profile = await prisma.userProfile.update({
            where: { userId: parseInt(id) },
            data: {
                height: height !== undefined ? parseFloat(height) : undefined,
                weight: weight !== undefined ? parseFloat(weight) : undefined,
                targetCalories: targetCalories ? parseInt(targetCalories) : undefined,
                targetProtein: targetProtein ? parseFloat(targetProtein) : undefined,
                targetFat: targetFat ? parseFloat(targetFat) : undefined,
                targetCarbs: targetCarbs ? parseFloat(targetCarbs) : undefined,
                allergies: allergies || undefined
            }
        });
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_PROFILE',
                entity: 'UserProfile',
                entityId: profile.id,
                newData: { height, weight, targetCalories }
            }
        });
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUserProfileByAdmin = updateUserProfileByAdmin;
// Lấy danh sách recipe (có phân trang, tìm kiếm)
const getAllRecipes = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const where = {};
        if (search)
            where.title = { contains: search, mode: 'insensitive' };
        const recipes = await prisma.recipe.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { food: true },
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.recipe.count({ where });
        res.json({
            success: true,
            data: recipes,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllRecipes = getAllRecipes;
// Xóa recipe
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.recipe.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Recipe deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteRecipe = deleteRecipe;
// Lấy danh sách reviews
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, rating, userId, foodId, search } = req.query;
        const where = {};
        if (rating)
            where.rating = parseInt(rating);
        if (userId)
            where.userId = parseInt(userId);
        if (foodId)
            where.foodId = parseInt(foodId);
        const keyword = String(search || '').trim();
        if (keyword) {
            const numericId = Number(keyword);
            where.OR = [
                { comment: { contains: keyword, mode: 'insensitive' } },
                { user: { name: { contains: keyword, mode: 'insensitive' } } },
                { user: { email: { contains: keyword, mode: 'insensitive' } } },
                { food: { name: { contains: keyword, mode: 'insensitive' } } },
                ...(Number.isInteger(numericId) ? [{ id: numericId }] : []),
            ];
        }
        const reviews = await prisma.review.findMany({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { user: { select: { name: true, email: true } }, food: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.review.count({ where });
        res.json({
            success: true,
            data: reviews,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllReviews = getAllReviews;
// Xóa review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Review deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteReview = deleteReview;
const getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const notifications = await prisma.notification.findMany({
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const total = await prisma.notification.count();
        res.json({
            success: true,
            data: notifications,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllNotifications = getAllNotifications;
// Xóa notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteNotification = deleteNotification;
// ==================== SETTINGS MANAGEMENT ====================
const getAllSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllSettings = getAllSettings;
const updateManySettings = async (req, res) => {
    try {
        const updates = req.body; // { key1: value1, key2: value2 }
        const operations = Object.entries(updates).map(([key, value]) => prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value), group: 'general' }
        }));
        await prisma.$transaction(operations);
        res.json({ success: true, message: 'Settings updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateManySettings = updateManySettings;
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { ingredients, steps, tools, ...rest } = data;
        await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                ...rest,
                ingredients: { deleteMany: {}, create: ingredients?.create || [] },
                steps: { deleteMany: {}, create: steps?.create || [] },
                tools: { deleteMany: {}, create: tools?.create || [] },
            },
        });
        res.json({ success: true, message: 'Cập nhật thành công' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
exports.updateRecipe = updateRecipe;
const createRecipe = async (req, res) => {
    try {
        const { foodId, ...data } = req.body;
        const { ingredients, steps, tools } = data;
        const recipe = await prisma.recipe.create({
            data: {
                foodId,
                title: data.title,
                summary: data.summary,
                prepTime: data.prepTime,
                cookTime: data.cookTime,
                totalTime: data.totalTime,
                servings: data.servings,
                difficulty: data.difficulty,
                tips: data.tips,
                nutritionNotes: data.nutritionNotes,
                ingredients: { create: ingredients?.create || [] },
                steps: { create: steps?.create || [] },
                tools: { create: tools?.create || [] },
            },
        });
        res.json({ success: true, data: recipe });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createRecipe = createRecipe;
// ==================== MEAL PLAN MANAGEMENT ====================
const getUserMealPlans = async (req, res) => {
    try {
        const { userId } = req.params;
        const plans = await prisma.mealPlan.findMany({
            where: { userId: parseInt(userId) },
            include: {
                details: {
                    include: { food: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserMealPlans = getUserMealPlans;
const createMealPlan = async (req, res) => {
    try {
        const { userId, name, startDate, endDate, details } = req.body;
        const plan = await prisma.mealPlan.create({
            data: {
                userId: parseInt(userId),
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: true,
                details: {
                    create: details.map((d) => ({
                        foodId: d.foodId,
                        mealType: d.mealType,
                        dayOfWeek: d.dayOfWeek,
                        quantity: d.quantity || 1,
                    })),
                },
            },
            include: { details: true },
        });
        res.json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createMealPlan = createMealPlan;
const updateMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate, isActive, details } = req.body;
        await prisma.mealPlan.update({
            where: { id: parseInt(id) },
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive,
                details: {
                    deleteMany: {},
                    create: details.map((d) => ({
                        foodId: d.foodId,
                        mealType: d.mealType,
                        dayOfWeek: d.dayOfWeek,
                        quantity: d.quantity || 1,
                    })),
                },
            },
        });
        res.json({ success: true, message: 'Cập nhật thành công' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateMealPlan = updateMealPlan;
const deleteMealPlan = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mealPlan.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Đã xóa' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMealPlan = deleteMealPlan;
// Gửi thông báo cho một hoặc nhiều user (danh sách userIds)
const sendToUsers = async (req, res) => {
    try {
        const { title, message, type, userIds } = req.body;
        if (!title || !message)
            return res.status(400).json({ error: 'Title and message required' });
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'userIds must be a non-empty array' });
        }
        const notifications = userIds.map(userId => ({
            userId,
            title,
            message,
            type: type || 'INFO',
        }));
        await prisma.notification.createMany({ data: notifications });
        res.json({ success: true, message: `Sent to ${userIds.length} users` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendToUsers = sendToUsers;
// Gửi thông báo cho một user cụ thể
const sendNotificationToUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { title, message, type = 'INFO' } = req.body;
        if (!title || !message)
            return res.status(400).json({ error: 'Title and message required' });
        const notification = await prisma.notification.create({
            data: { userId: parseInt(userId), title, message, type },
        });
        // Ghi audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'SEND_NOTIFICATION',
                entity: 'Notification',
                entityId: notification.id,
                newData: { userId: parseInt(userId), title, message, type },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        res.json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendNotificationToUser = sendNotificationToUser;
const sendNotificationToMultipleUsers = async (req, res) => {
    try {
        const { userIds, title, message, type = 'INFO' } = req.body;
        if (!userIds || !userIds.length)
            return res.status(400).json({ error: 'User IDs required' });
        const notifications = userIds.map((userId) => ({
            userId, title, message, type,
        }));
        await prisma.notification.createMany({ data: notifications });
        // Ghi audit log (lưu danh sách userIds)
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'SEND_NOTIFICATION_MULTIPLE',
                entity: 'Notification',
                newData: { userIds, title, message, type },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        res.json({ success: true, message: `Sent to ${userIds.length} users` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendNotificationToMultipleUsers = sendNotificationToMultipleUsers;
const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type = 'INFO' } = req.body;
        const users = await prisma.user.findMany({ select: { id: true } });
        const notifications = users.map(user => ({ userId: user.id, title, message, type }));
        await prisma.notification.createMany({ data: notifications });
        // Ghi audit log
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'BROADCAST_NOTIFICATION',
                entity: 'Notification',
                newData: { title, message, type, totalUsers: users.length },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        });
        res.json({ success: true, message: `Sent to ${users.length} users` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.broadcastNotification = broadcastNotification;
