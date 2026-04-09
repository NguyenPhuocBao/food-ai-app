"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateDailyNutrition = exports.normalizeToDayStart = void 0;
const client_1 = require("@prisma/client");
const timezone_util_1 = require("../utils/timezone.util");
const prisma = new client_1.PrismaClient();
const normalizeToDayStart = (value) => {
    return (0, timezone_util_1.toAppDayStart)(value);
};
exports.normalizeToDayStart = normalizeToDayStart;
const recalculateDailyNutrition = async (userId, dateValue) => {
    const date = (0, exports.normalizeToDayStart)(dateValue);
    const nextDate = new Date(date.getTime() + 86400000);
    const dailyMeals = await prisma.meal.findMany({
        where: {
            userId,
            eatenAt: {
                gte: date,
                lt: nextDate,
            },
        },
    });
    if (dailyMeals.length === 0) {
        await prisma.dailyNutrition.deleteMany({
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
    return prisma.dailyNutrition.upsert({
        where: { userId_date: { userId, date } },
        update: totals,
        create: { userId, date, ...totals },
    });
};
exports.recalculateDailyNutrition = recalculateDailyNutrition;
