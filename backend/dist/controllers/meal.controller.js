"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeal = exports.updateMeal = exports.getMealById = exports.getMealHistory = exports.getMealsByDate = exports.addMeal = void 0;
const client_1 = require("@prisma/client");
const nutrition_service_1 = require("../services/nutrition.service");
const timezone_util_1 = require("../utils/timezone.util");
const prisma = new client_1.PrismaClient();
const addMeal = async (req, res) => {
    try {
        const { foodId, mealType, eatenAt, quantity, notes } = req.body;
        const userId = req.user.id;
        const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
        if (!food)
            return res.status(404).json({ error: 'Food not found' });
        const meal = await prisma.meal.create({
            data: {
                userId,
                foodId,
                mealType: mealType,
                eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
                quantity: quantity || 1,
                calories: food.calories * (quantity || 1),
                protein: food.protein * (quantity || 1),
                fat: food.fat * (quantity || 1),
                carbs: food.carbs * (quantity || 1),
                notes,
            },
            include: { food: true },
        });
        await (0, nutrition_service_1.recalculateDailyNutrition)(userId, meal.eatenAt);
        res.json({ success: true, data: meal });
    }
    catch (error) {
        console.error('Add meal error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.addMeal = addMeal;
const getMealsByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = (req.user.role === 'ADMIN' && req.query.userId)
            ? parseInt(req.query.userId)
            : req.user.id;
        const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(date ? String(date) : new Date());
        const meals = await prisma.meal.findMany({
            where: { userId, eatenAt: { gte: start, lt: endExclusive } },
            include: { food: true },
            orderBy: { eatenAt: 'asc' }
        });
        const nutrition = await (0, nutrition_service_1.recalculateDailyNutrition)(userId, start);
        res.json({ success: true, data: { meals, nutrition } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealsByDate = getMealsByDate;
const getMealHistory = async (req, res) => {
    try {
        const { limit = 50, startDate, endDate } = req.query;
        const userId = (req.user.role === 'ADMIN' && req.query.userId)
            ? parseInt(req.query.userId)
            : req.user.id;
        const where = { userId };
        if (startDate)
            where.eatenAt = { gte: new Date(startDate) };
        if (endDate)
            where.eatenAt = { ...where.eatenAt, lte: new Date(endDate) };
        const meals = await prisma.meal.findMany({
            where,
            include: { food: true },
            orderBy: { eatenAt: 'desc' },
            take: Number(limit)
        });
        res.json({ success: true, data: meals, count: meals.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealHistory = getMealHistory;
const getMealById = async (req, res) => {
    try {
        const mealId = parseInt(req.params.id);
        if (!Number.isFinite(mealId)) {
            return res.status(400).json({ error: 'Invalid meal id' });
        }
        const where = { id: mealId };
        if (req.user.role !== 'ADMIN') {
            where.userId = req.user.id;
        }
        const meal = await prisma.meal.findFirst({
            where,
            include: {
                food: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!meal)
            return res.status(404).json({ error: 'Meal not found' });
        res.json({ success: true, data: meal });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMealById = getMealById;
const updateMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, notes } = req.body;
        const where = { id: parseInt(id) };
        if (req.user.role !== 'ADMIN') {
            where.userId = req.user.id;
        }
        const existingMeal = await prisma.meal.findFirst({ where, include: { food: true } });
        if (!existingMeal)
            return res.status(404).json({ error: 'Meal not found' });
        const updatedMeal = await prisma.meal.update({
            where: { id: parseInt(id) },
            data: {
                quantity: quantity || existingMeal.quantity,
                notes,
                calories: existingMeal.food.calories * (quantity || existingMeal.quantity),
                protein: existingMeal.food.protein * (quantity || existingMeal.quantity),
                fat: existingMeal.food.fat * (quantity || existingMeal.quantity),
                carbs: existingMeal.food.carbs * (quantity || existingMeal.quantity)
            },
            include: { food: true }
        });
        // Recalculate daily nutrition
        await (0, nutrition_service_1.recalculateDailyNutrition)(existingMeal.userId, existingMeal.eatenAt);
        res.json({ success: true, data: updatedMeal });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateMeal = updateMeal;
const deleteMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const where = { id: parseInt(id) };
        if (req.user.role !== 'ADMIN') {
            where.userId = req.user.id;
        }
        const meal = await prisma.meal.findFirst({ where });
        if (!meal)
            return res.status(404).json({ error: 'Meal not found' });
        await prisma.meal.delete({ where: { id: parseInt(id) } });
        // Recalculate daily nutrition
        await (0, nutrition_service_1.recalculateDailyNutrition)(meal.userId, meal.eatenAt);
        res.json({ success: true, message: 'Meal deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMeal = deleteMeal;
