"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERSONALIZATION_KEYS = exports.getTodayMealWindow = exports.resolvePersonalTargets = exports.getHydrationSummaryForRange = exports.addHydrationLog = exports.getHydrationRecord = exports.updatePersonalRoutine = exports.getPersonalRoutine = void 0;
const timezone_util_1 = require("../utils/timezone.util");
const health_engine_service_1 = require("./health-engine.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const ROUTINE_GROUP = 'personalization';
const ROUTINE_KEY_PREFIX = 'routine';
const HYDRATION_GROUP = 'hydration';
const HYDRATION_KEY_PREFIX = 'hydration';
const DEFAULT_ROUTINE = {
    wakeUpAt: '06:30',
    sleepAt: '23:00',
    breakfastAt: '07:30',
    lunchAt: '12:30',
    dinnerAt: '19:00',
    waterGoalMl: 2200,
    remindersEnabled: true,
};
const activityFactor = {
    SEDENTARY: 1,
    LIGHT: 1.05,
    MODERATE: 1.12,
    ACTIVE: 1.2,
    VERY_ACTIVE: 1.28,
};
const goalAdjustment = {
    WEIGHT_LOSS: -320,
    MAINTENANCE: 0,
    WEIGHT_GAIN: 260,
    MUSCLE_GAIN: 180,
};
const safeJsonParse = (value, fallback) => {
    if (!value)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
};
const getRoutineKey = (userId) => `${ROUTINE_KEY_PREFIX}:${userId}`;
const getHydrationKey = (userId, dateKey) => `${HYDRATION_KEY_PREFIX}:${dateKey}:${userId}`;
const normalizeTimeText = (value, fallback) => {
    if (!value)
        return fallback;
    const [hourText, minuteText] = value.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (Number.isInteger(hour) &&
        Number.isInteger(minute) &&
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    return fallback;
};
const normalizeRoutine = (input) => {
    if (!input)
        return { ...DEFAULT_ROUTINE };
    return {
        wakeUpAt: normalizeTimeText(input.wakeUpAt, DEFAULT_ROUTINE.wakeUpAt),
        sleepAt: normalizeTimeText(input.sleepAt, DEFAULT_ROUTINE.sleepAt),
        breakfastAt: normalizeTimeText(input.breakfastAt, DEFAULT_ROUTINE.breakfastAt),
        lunchAt: normalizeTimeText(input.lunchAt, DEFAULT_ROUTINE.lunchAt),
        dinnerAt: normalizeTimeText(input.dinnerAt, DEFAULT_ROUTINE.dinnerAt),
        waterGoalMl: Math.max(1200, Math.min(5000, Number(input.waterGoalMl || DEFAULT_ROUTINE.waterGoalMl))),
        remindersEnabled: input.remindersEnabled !== undefined ? Boolean(input.remindersEnabled) : DEFAULT_ROUTINE.remindersEnabled,
    };
};
const getPersonalRoutine = async (userId) => {
    const setting = await prisma_1.default.systemSetting.findUnique({
        where: { key: getRoutineKey(userId) },
        select: { value: true },
    });
    return normalizeRoutine(safeJsonParse(setting?.value, DEFAULT_ROUTINE));
};
exports.getPersonalRoutine = getPersonalRoutine;
const updatePersonalRoutine = async (userId, payload) => {
    const current = await (0, exports.getPersonalRoutine)(userId);
    const nextValue = normalizeRoutine({ ...current, ...payload });
    await prisma_1.default.systemSetting.upsert({
        where: { key: getRoutineKey(userId) },
        update: {
            value: JSON.stringify(nextValue),
            group: ROUTINE_GROUP,
            updatedAt: new Date(),
        },
        create: {
            key: getRoutineKey(userId),
            value: JSON.stringify(nextValue),
            group: ROUTINE_GROUP,
        },
    });
    return nextValue;
};
exports.updatePersonalRoutine = updatePersonalRoutine;
const getHydrationRecord = async (userId, date = new Date()) => {
    const dateKey = (0, timezone_util_1.toAppDateKey)(date);
    const setting = await prisma_1.default.systemSetting.findUnique({ where: { key: getHydrationKey(userId, dateKey) } });
    const parsed = safeJsonParse(setting?.value, {
        dateKey,
        totalMl: 0,
        logs: [],
    });
    return {
        dateKey,
        totalMl: Number(parsed.totalMl || 0),
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
};
exports.getHydrationRecord = getHydrationRecord;
const addHydrationLog = async (userId, amountMl, loggedAt = new Date()) => {
    const normalizedAmount = Math.max(50, Math.min(1200, Math.round(amountMl || 250)));
    const dateKey = (0, timezone_util_1.toAppDateKey)(loggedAt);
    const key = getHydrationKey(userId, dateKey);
    const current = await (0, exports.getHydrationRecord)(userId, loggedAt);
    const logs = [
        ...current.logs,
        {
            amountMl: normalizedAmount,
            loggedAt: new Date(loggedAt).toISOString(),
        },
    ].slice(-30);
    const nextValue = {
        dateKey,
        totalMl: current.totalMl + normalizedAmount,
        logs,
    };
    await prisma_1.default.systemSetting.upsert({
        where: { key },
        update: {
            value: JSON.stringify(nextValue),
            group: HYDRATION_GROUP,
            updatedAt: new Date(),
        },
        create: {
            key,
            value: JSON.stringify(nextValue),
            group: HYDRATION_GROUP,
        },
    });
    return nextValue;
};
exports.addHydrationLog = addHydrationLog;
const getHydrationSummaryForRange = async (userId, startDate, endExclusive) => {
    const keys = [];
    let cursor = new Date(startDate);
    while (cursor < endExclusive) {
        keys.push(getHydrationKey(userId, (0, timezone_util_1.toAppDateKey)(cursor)));
        cursor = (0, timezone_util_1.shiftAppDays)(cursor, 1);
    }
    const rows = await prisma_1.default.systemSetting.findMany({
        where: { key: { in: keys }, group: HYDRATION_GROUP },
        select: { key: true, value: true },
    });
    const totalMl = rows.reduce((sum, row) => {
        const parsed = safeJsonParse(row.value, {
            dateKey: '',
            totalMl: 0,
            logs: [],
        });
        return sum + Number(parsed.totalMl || 0);
    }, 0);
    const days = Math.max(1, keys.length);
    return {
        totalMl,
        days,
        avgMl: Math.round(totalMl / days),
    };
};
exports.getHydrationSummaryForRange = getHydrationSummaryForRange;
const resolvePersonalTargets = async (userId) => {
    const [profile, goal, routine] = await Promise.all([
        prisma_1.default.userProfile.findUnique({ where: { userId } }),
        prisma_1.default.userGoal.findFirst({ where: { userId, isActive: true }, orderBy: { startDate: 'desc' } }),
        (0, exports.getPersonalRoutine)(userId),
    ]);
    const activity = profile?.activityLevel || 'MODERATE';
    const goalType = goal?.goalType || 'MAINTENANCE';
    const baseCalories = (0, health_engine_service_1.normalizeGoalCalories)(goal?.targetCalories || profile?.targetCalories || 2000);
    const adjustedCalories = Math.round(baseCalories * (activityFactor[activity] || 1) + goalAdjustment[goalType]);
    const targetCalories = (0, health_engine_service_1.normalizeGoalCalories)(adjustedCalories);
    const targetProtein = Math.max(70, Math.round(goal?.targetProtein || profile?.targetProtein || 130));
    const targetFat = Math.max(35, Math.round(goal?.targetFat || profile?.targetFat || 55));
    const targetCarbs = Math.max(80, Math.round(goal?.targetCarbs || profile?.targetCarbs || 240));
    return {
        goalType,
        targetCalories,
        targetProtein,
        targetFat,
        targetCarbs,
        targetWeight: goal?.targetWeight || null,
        allergies: profile?.allergies || [],
        dietaryPref: profile?.dietaryPref || [],
        activityLevel: activity,
        routine,
    };
};
exports.resolvePersonalTargets = resolvePersonalTargets;
const getTodayMealWindow = async (userId, date = new Date()) => {
    const routine = await (0, exports.getPersonalRoutine)(userId);
    const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(date);
    const meals = await prisma_1.default.meal.findMany({
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
                },
            },
        },
    });
    return { routine, meals };
};
exports.getTodayMealWindow = getTodayMealWindow;
exports.PERSONALIZATION_KEYS = {
    ROUTINE_GROUP,
    ROUTINE_KEY_PREFIX,
    HYDRATION_GROUP,
    HYDRATION_KEY_PREFIX,
    getHydrationKey,
};
