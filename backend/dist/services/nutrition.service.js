"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateDailyNutrition = exports.normalizeToDayStart = void 0;
const timezone_util_1 = require("../utils/timezone.util");
const prisma_1 = __importDefault(require("../lib/prisma"));
const normalizeToDayStart = (value) => {
    return (0, timezone_util_1.toAppDayStart)(value);
};
exports.normalizeToDayStart = normalizeToDayStart;
const AUTO_APPLIED_MEAL_PLAN_NOTE_PREFIX = 'Auto-applied from meal plan:';
const cleanupOrphanAutoAppliedMealPlanMeals = async (userId, date, nextDate) => {
    await prisma_1.default.meal.deleteMany({
        where: {
            userId,
            eatenAt: {
                gte: date,
                lt: nextDate,
            },
            isFromAI: true,
            notes: { startsWith: AUTO_APPLIED_MEAL_PLAN_NOTE_PREFIX },
            mealPlanId: { equals: null },
        },
    });
};
const recalculateDailyNutrition = async (userId, dateValue) => {
    const date = (0, exports.normalizeToDayStart)(dateValue);
    const nextDate = new Date(date.getTime() + 86400000);
    await cleanupOrphanAutoAppliedMealPlanMeals(userId, date, nextDate);
    const dailyMeals = await prisma_1.default.meal.findMany({
        where: {
            userId,
            eatenAt: {
                gte: date,
                lt: nextDate,
            },
        },
    });
    if (dailyMeals.length === 0) {
        await prisma_1.default.dailyNutrition.deleteMany({
            where: {
                userId,
                date,
            },
        });
        return null;
    }
    const totals = dailyMeals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + meal.calories,
        totalProtein: acc.totalProtein + meal.protein,
        totalFat: acc.totalFat + meal.fat,
        totalCarbs: acc.totalCarbs + meal.carbs,
        totalMeals: acc.totalMeals + 1,
    }), { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, totalMeals: 0 });
    return prisma_1.default.dailyNutrition.upsert({
        where: { userId_date: { userId, date } },
        update: totals,
        create: { userId, date, ...totals },
    });
};
exports.recalculateDailyNutrition = recalculateDailyNutrition;
