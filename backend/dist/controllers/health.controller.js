"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyActions = exports.logHydration = exports.getHydrationToday = exports.updateRoutine = exports.getPersonalization = exports.getWeeklyHealth = exports.getDailyHealth = exports.getMealHealth = void 0;
const client_1 = require("@prisma/client");
const health_engine_service_1 = require("../services/health-engine.service");
const personalization_service_1 = require("../services/personalization.service");
const timezone_util_1 = require("../utils/timezone.util");
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
const OFFSET_HOURS = (0, timezone_util_1.getAppUtcOffsetHours)();
const resolveUserId = (req) => req.user.role === 'ADMIN' && req.query.userId
    ? parseInt(req.query.userId, 10)
    : req.user.id;
const REMINDER_SETTING_GROUP = 'runtime';
const DAILY_ENGAGEMENT_KEY_PREFIX = 'daily_engagement';
const markEngagementReminderSent = async (key) => {
    await prisma.systemSetting.upsert({
        where: { key },
        update: {
            value: String(Date.now()),
            group: REMINDER_SETTING_GROUP,
            updatedAt: new Date(),
        },
        create: {
            key,
            value: String(Date.now()),
            group: REMINDER_SETTING_GROUP,
        },
    });
};
const runDailyEngagementCheck = async (userId) => {
    const todayStart = (0, timezone_util_1.toAppDayStart)(new Date());
    const yesterdayStart = (0, timezone_util_1.shiftAppDays)(todayStart, -1);
    const yesterdayEnd = todayStart;
    const dateKey = (0, timezone_util_1.toAppDateKey)(yesterdayStart);
    const notifyKey = `${DAILY_ENGAGEMENT_KEY_PREFIX}:no_meal_notification:${dateKey}:${userId}`;
    const emailKey = `${DAILY_ENGAGEMENT_KEY_PREFIX}:no_meal_email:${dateKey}:${userId}`;
    const [mealCount, sentRows, user] = await Promise.all([
        prisma.meal.count({
            where: {
                userId,
                eatenAt: { gte: yesterdayStart, lt: yesterdayEnd },
            },
        }),
        prisma.systemSetting.findMany({
            where: {
                group: REMINDER_SETTING_GROUP,
                key: { in: [notifyKey, emailKey] },
            },
            select: { key: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true, isActive: true, role: true },
        }),
    ]);
    if (mealCount > 0 || !user?.isActive || user.role !== 'USER')
        return;
    const sentKeys = new Set(sentRows.map((row) => row.key));
    if (!sentKeys.has(notifyKey)) {
        await prisma.notification.create({
            data: {
                userId,
                title: 'Hom qua ban chua ghi bua an nao',
                message: `FoodAI chua ghi nhan bua an nao trong ngay ${dateKey}. Hay ghi nhat ky de he thong theo doi dinh duong chinh xac hon.`,
                type: client_1.NotificationType.WARNING,
                data: {
                    source: 'daily_engagement',
                    reminderType: 'no_meal_previous_day',
                    dateKey,
                },
            },
        });
        await markEngagementReminderSent(notifyKey);
    }
    if (!sentKeys.has(emailKey)) {
        const sent = await (0, email_service_1.sendNoMealReminderEmail)({
            toEmail: user.email,
            userName: user.name,
            dateKey,
        });
        if (sent) {
            await markEngagementReminderSent(emailKey);
        }
    }
};
const getWeekRange = (anchor) => {
    const dayStart = (0, timezone_util_1.toAppDayStart)(anchor || new Date());
    const localized = new Date(dayStart.getTime() + OFFSET_HOURS * 60 * 60 * 1000);
    const weekday = localized.getUTCDay();
    const weekStart = (0, timezone_util_1.shiftAppDays)(dayStart, -weekday);
    const weekEndExclusive = (0, timezone_util_1.shiftAppDays)(weekStart, 7);
    return { weekStart, weekEndExclusive };
};
const fallbackError = (res, scope, fallbackData) => res.status(200).json({
    success: false,
    fallback: true,
    scope,
    data: fallbackData,
});
const getMealHealth = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const mealId = parseInt(req.params.id, 10);
        const meal = await prisma.meal.findFirst({
            where: {
                id: mealId,
                ...(req.user.role === 'ADMIN' ? {} : { userId }),
            },
            include: {
                food: {
                    select: {
                        name: true,
                        category: true,
                        description: true,
                        mealRoles: true,
                        cookingMethod: true,
                        portionType: true,
                    },
                },
            },
        });
        if (!meal)
            return res.status(404).json({ error: 'Meal not found' });
        const result = (0, health_engine_service_1.evaluateMealHealth)(meal);
        res.json({ success: true, data: result });
    }
    catch (error) {
        fallbackError(res, 'meal', {
            score: 0,
            grade: 'D',
            alerts: ['Khong th? phan tich bua an luc nay.'],
            positives: [],
        });
    }
};
exports.getMealHealth = getMealHealth;
const getDailyHealth = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const date = String(req.query.date || new Date().toISOString());
        const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(date);
        const shouldRunEngagementCheck = (0, timezone_util_1.toAppDateKey)(start) === (0, timezone_util_1.toAppDateKey)(new Date());
        const meals = await prisma.meal.findMany({
            where: {
                userId,
                eatenAt: { gte: start, lt: endExclusive },
            },
            orderBy: { eatenAt: 'asc' },
            include: {
                food: {
                    select: {
                        name: true,
                        category: true,
                        description: true,
                        mealRoles: true,
                        cookingMethod: true,
                        portionType: true,
                    },
                },
            },
        });
        const [dailyHealth, hydration, targets] = await Promise.all([
            Promise.resolve((0, health_engine_service_1.evaluateDailyHealth)(date, meals)),
            (0, personalization_service_1.getHydrationRecord)(userId, date),
            (0, personalization_service_1.resolvePersonalTargets)(userId),
            shouldRunEngagementCheck ? runDailyEngagementCheck(userId).catch((error) => {
                console.error('[daily-engagement] check failed:', error);
            }) : Promise.resolve(),
        ]);
        res.json({
            success: true,
            data: {
                ...dailyHealth,
                hydration: {
                    totalMl: hydration.totalMl,
                    goalMl: targets.routine.waterGoalMl,
                    percent: Math.min(100, Math.round((hydration.totalMl / Math.max(1, targets.routine.waterGoalMl)) * 100)),
                },
            },
        });
    }
    catch (error) {
        fallbackError(res, 'daily', {
            score: 0,
            grade: 'D',
            alerts: ['Khong th? lay du lieu suc khoe hom nay.'],
            highlights: [],
            recommendations: [],
            mealScores: [],
            stats: { meals: 0, veggieMeals: 0, saltyMeals: 0, lateMeals: 0 },
            hydration: { totalMl: 0, goalMl: 2200, percent: 0 },
        });
    }
};
exports.getDailyHealth = getDailyHealth;
const getWeeklyHealth = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const anchorDate = (req.query.date || req.body?.date || new Date());
        const { weekStart, weekEndExclusive } = getWeekRange(anchorDate);
        const meals = await prisma.meal.findMany({
            where: {
                userId,
                eatenAt: { gte: weekStart, lt: weekEndExclusive },
            },
            orderBy: { eatenAt: 'asc' },
            include: {
                food: {
                    select: {
                        name: true,
                        category: true,
                        description: true,
                    },
                },
            },
        });
        const dailyResults = Array.from({ length: 7 }, (_, index) => {
            const dayStart = (0, timezone_util_1.shiftAppDays)(weekStart, index);
            const nextDay = (0, timezone_util_1.shiftAppDays)(dayStart, 1);
            const dayMeals = meals.filter((meal) => meal.eatenAt >= dayStart && meal.eatenAt < nextDay);
            return (0, health_engine_service_1.evaluateDailyHealth)(dayStart, dayMeals);
        });
        const [targets, hydrationSummary] = await Promise.all([
            (0, personalization_service_1.resolvePersonalTargets)(userId),
            (0, personalization_service_1.getHydrationSummaryForRange)(userId, weekStart, weekEndExclusive),
        ]);
        const weeklySummary = (0, health_engine_service_1.buildWeeklyRecommendations)(dailyResults, targets.targetCalories, {
            avgMl: hydrationSummary.avgMl,
            goalMl: targets.routine.waterGoalMl,
        });
        res.json({
            success: true,
            data: {
                weekStart,
                weekEndExclusive,
                daily: dailyResults,
                summary: {
                    ...weeklySummary,
                    hydration: {
                        ...hydrationSummary,
                        goalMl: targets.routine.waterGoalMl,
                    },
                },
            },
        });
    }
    catch (error) {
        fallbackError(res, 'weekly', {
            daily: [],
            summary: {
                avgScore: 0,
                alerts: ['Khong th? tong hop suc khoe tuan nay.'],
                recommendations: ['Hay tiep tuc ghi nhat ky de he thong phan tich lai.'],
                hydration: { totalMl: 0, days: 7, avgMl: 0, goalMl: 2200 },
            },
        });
    }
};
exports.getWeeklyHealth = getWeeklyHealth;
const getPersonalization = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const data = await (0, personalization_service_1.resolvePersonalTargets)(userId);
        res.json({ success: true, data });
    }
    catch (error) {
        fallbackError(res, 'personalization', {
            goalType: 'MAINTENANCE',
            targetCalories: 2000,
            targetProtein: 140,
            targetFat: 55,
            targetCarbs: 250,
            targetWeight: null,
            allergies: [],
            dietaryPref: [],
            activityLevel: 'MODERATE',
            routine: {
                wakeUpAt: '06:30',
                sleepAt: '23:00',
                breakfastAt: '07:30',
                lunchAt: '12:30',
                dinnerAt: '19:00',
                waterGoalMl: 2200,
                remindersEnabled: true,
            },
        });
    }
};
exports.getPersonalization = getPersonalization;
const updateRoutine = async (req, res) => {
    try {
        const userId = req.user.id;
        const routine = await (0, personalization_service_1.updatePersonalRoutine)(userId, req.body || {});
        res.json({ success: true, data: routine });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Cannot update routine' });
    }
};
exports.updateRoutine = updateRoutine;
const getHydrationToday = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const date = String(req.query.date || new Date().toISOString());
        const [record, targets] = await Promise.all([
            (0, personalization_service_1.getHydrationRecord)(userId, date),
            (0, personalization_service_1.resolvePersonalTargets)(userId),
        ]);
        const goalMl = targets.routine.waterGoalMl;
        res.json({
            success: true,
            data: {
                ...record,
                goalMl,
                percent: Math.min(100, Math.round((record.totalMl / Math.max(1, goalMl)) * 100)),
            },
        });
    }
    catch (error) {
        fallbackError(res, 'hydration', {
            dateKey: '',
            totalMl: 0,
            logs: [],
            goalMl: 2200,
            percent: 0,
        });
    }
};
exports.getHydrationToday = getHydrationToday;
const logHydration = async (req, res) => {
    try {
        const userId = req.user.id;
        const amountMl = Number(req.body?.amountMl || 250);
        const [record, targets] = await Promise.all([
            (0, personalization_service_1.addHydrationLog)(userId, amountMl),
            (0, personalization_service_1.resolvePersonalTargets)(userId),
        ]);
        const goalMl = targets.routine.waterGoalMl;
        res.json({
            success: true,
            data: {
                ...record,
                goalMl,
                percent: Math.min(100, Math.round((record.totalMl / Math.max(1, goalMl)) * 100)),
            },
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Cannot log hydration' });
    }
};
exports.logHydration = logHydration;
const getWeeklyActions = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const report = await prisma.weeklyReport.findFirst({
            where: { userId },
            orderBy: [{ weekStart: 'desc' }, { createdAt: 'desc' }],
        });
        if (!report) {
            return res.json({
                success: true,
                data: {
                    recommendations: ['Chua co weekly report. Hay tao report de nhan khuyen nghi cu the.'],
                    alerts: [],
                    healthScore: 0,
                },
            });
        }
        const reportData = (report.reportData || {});
        res.json({
            success: true,
            data: {
                recommendations: reportData.recommendations || [],
                alerts: reportData.alerts || [],
                healthScore: reportData.healthScore || 0,
                hydration: reportData.hydration || null,
                weekStart: report.weekStart,
                weekEnd: report.weekEnd,
            },
        });
    }
    catch (error) {
        fallbackError(res, 'weekly-actions', {
            recommendations: ['Khong th? lay khuyen nghi tuan nay.'],
            alerts: [],
            healthScore: 0,
        });
    }
};
exports.getWeeklyActions = getWeeklyActions;
