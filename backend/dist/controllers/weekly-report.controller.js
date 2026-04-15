"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWeeklyReport = exports.getLatestWeeklyReport = exports.getWeeklyReports = exports.generateWeeklyReport = void 0;
const client_1 = require("@prisma/client");
const timezone_util_1 = require("../utils/timezone.util");
const health_engine_service_1 = require("../services/health-engine.service");
const personalization_service_1 = require("../services/personalization.service");
const prisma = new client_1.PrismaClient();
const OFFSET_HOURS = (0, timezone_util_1.getAppUtcOffsetHours)();
const resolveUserId = (req) => (req.user.role === 'ADMIN' && req.query.userId)
    ? parseInt(req.query.userId, 10)
    : req.user.id;
const getWeekRange = (anchor) => {
    const base = (0, timezone_util_1.toAppDayStart)(anchor || new Date());
    const baseInLocal = new Date(base.getTime() + OFFSET_HOURS * 60 * 60 * 1000);
    const weekday = baseInLocal.getUTCDay();
    const weekStart = (0, timezone_util_1.shiftAppDays)(base, -weekday);
    const weekEndExclusive = (0, timezone_util_1.shiftAppDays)(weekStart, 7);
    const weekEnd = new Date(weekEndExclusive.getTime() - 1);
    return { weekStart, weekEnd, weekEndExclusive };
};
const computeWeeklySnapshot = async (userId, weekStart, weekEndExclusive) => {
    const meals = await prisma.meal.findMany({
        where: {
            userId,
            eatenAt: { gte: weekStart, lt: weekEndExclusive },
        },
        select: {
            id: true,
            eatenAt: true,
            calories: true,
            protein: true,
            fat: true,
            carbs: true,
            mealType: true,
            foodId: true,
            notes: true,
            food: {
                select: {
                    name: true,
                    category: true,
                    description: true,
                },
            },
        },
    });
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const daily = Array.from({ length: 7 }, (_, index) => {
        const date = (0, timezone_util_1.shiftAppDays)(weekStart, index);
        return {
            date: (0, timezone_util_1.toAppDateKey)(date),
            day: dayLabels[index],
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            meals: 0,
        };
    });
    const dayMap = new Map(daily.map((item) => [item.date, item]));
    meals.forEach((meal) => {
        const key = (0, timezone_util_1.toAppDateKey)(meal.eatenAt);
        const bucket = dayMap.get(key);
        if (!bucket)
            return;
        bucket.calories += meal.calories;
        bucket.protein += meal.protein;
        bucket.fat += meal.fat;
        bucket.carbs += meal.carbs;
        bucket.meals += 1;
    });
    const totals = daily.reduce((acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        fat: acc.fat + day.fat,
        carbs: acc.carbs + day.carbs,
        meals: acc.meals + day.meals,
        activeDays: acc.activeDays + (day.calories > 0 ? 1 : 0),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, meals: 0, activeDays: 0 });
    const divisor = totals.activeDays || 1;
    const average = {
        calories: Math.round(totals.calories / divisor),
        protein: Math.round((totals.protein / divisor) * 10) / 10,
        fat: Math.round((totals.fat / divisor) * 10) / 10,
        carbs: Math.round((totals.carbs / divisor) * 10) / 10,
    };
    const bestDay = daily.reduce((best, current) => (current.calories > best.calories ? current : best), daily[0]);
    const worstDay = daily.reduce((worst, current) => (current.calories < worst.calories ? current : worst), daily[0]);
    const dailyHealth = Array.from({ length: 7 }, (_, index) => {
        const dayStart = (0, timezone_util_1.shiftAppDays)(weekStart, index);
        const nextDay = (0, timezone_util_1.shiftAppDays)(dayStart, 1);
        const dayMeals = meals.filter((meal) => meal.eatenAt >= dayStart && meal.eatenAt < nextDay);
        return (0, health_engine_service_1.evaluateDailyHealth)(dayStart, dayMeals);
    });
    const [targets, hydrationSummary] = await Promise.all([
        (0, personalization_service_1.resolvePersonalTargets)(userId),
        (0, personalization_service_1.getHydrationSummaryForRange)(userId, weekStart, weekEndExclusive),
    ]);
    const weeklyHealth = (0, health_engine_service_1.buildWeeklyRecommendations)(dailyHealth, targets.targetCalories, {
        avgMl: hydrationSummary.avgMl,
        goalMl: targets.routine.waterGoalMl,
    });
    return {
        avgCalories: average.calories,
        avgProtein: average.protein,
        avgFat: average.fat,
        avgCarbs: average.carbs,
        reportData: {
            totals,
            average,
            daily,
            bestDay,
            worstDay,
            dailyHealth,
            healthScore: weeklyHealth.avgScore,
            alerts: weeklyHealth.alerts,
            recommendations: weeklyHealth.recommendations,
            hydration: {
                ...hydrationSummary,
                goalMl: targets.routine.waterGoalMl,
            },
            target: {
                calories: targets.targetCalories,
                protein: targets.targetProtein,
                fat: targets.targetFat,
                carbs: targets.targetCarbs,
            },
            generatedAt: new Date().toISOString(),
        },
    };
};
const generateWeeklyReport = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const anchorDate = (req.body?.date || req.query?.date);
        const { weekStart, weekEnd, weekEndExclusive } = getWeekRange(anchorDate ? String(anchorDate) : undefined);
        const snapshot = await computeWeeklySnapshot(userId, weekStart, weekEndExclusive);
        const existing = await prisma.weeklyReport.findFirst({
            where: { userId, weekStart },
            orderBy: { createdAt: 'desc' },
        });
        const report = existing
            ? await prisma.weeklyReport.update({
                where: { id: existing.id },
                data: { weekEnd, ...snapshot },
            })
            : await prisma.weeklyReport.create({
                data: {
                    userId,
                    weekStart,
                    weekEnd,
                    ...snapshot,
                },
            });
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.generateWeeklyReport = generateWeeklyReport;
const getWeeklyReports = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const limit = Math.max(1, Math.min(52, Number(req.query.limit || 12)));
        const reports = await prisma.weeklyReport.findMany({
            where: { userId },
            orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
            take: limit,
        });
        res.json({ success: true, data: reports });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getWeeklyReports = getWeeklyReports;
const getLatestWeeklyReport = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const report = await prisma.weeklyReport.findFirst({
            where: { userId },
            orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
        });
        res.json({ success: true, data: report || null });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLatestWeeklyReport = getLatestWeeklyReport;
const deleteWeeklyReport = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const reportId = parseInt(req.params.id, 10);
        if (!Number.isFinite(reportId))
            return res.status(400).json({ error: 'Invalid report id' });
        const report = await prisma.weeklyReport.findFirst({
            where: { id: reportId, userId },
        });
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        await prisma.weeklyReport.delete({ where: { id: reportId } });
        res.json({ success: true, message: 'Weekly report deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteWeeklyReport = deleteWeeklyReport;
