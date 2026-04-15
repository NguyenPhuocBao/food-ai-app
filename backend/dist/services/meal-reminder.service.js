"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopMealReminderScheduler = exports.startMealReminderScheduler = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const timezone_util_1 = require("../utils/timezone.util");
const email_service_1 = require("./email.service");
const personalization_service_1 = require("./personalization.service");
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const REMINDER_SETTING_GROUP = 'runtime';
const REMINDER_KEY_PREFIX = 'meal_reminder';
const parseIntervalMs = () => {
    const raw = Number(process.env.MEAL_REMINDER_INTERVAL_MS || DEFAULT_INTERVAL_MS);
    if (!Number.isFinite(raw) || raw < 60000)
        return DEFAULT_INTERVAL_MS;
    return raw;
};
const parseTime = (value, fallbackHour, fallbackMinute) => {
    const [hourText, minuteText] = (value || '').split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (!Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59) {
        return { hour: fallbackHour, minute: fallbackMinute };
    }
    return { hour, minute };
};
const BREAKFAST_AT = parseTime(process.env.BREAKFAST_REMINDER_AT || '', 9, 30);
const LUNCH_AT = parseTime(process.env.LUNCH_REMINDER_AT || '', 13, 30);
const DINNER_AT = parseTime(process.env.DINNER_REMINDER_AT || '', 20, 0);
const NO_MEAL_EMAIL_AT = parseTime(process.env.NO_MEAL_EMAIL_AT || '', 21, 30);
const REMINDER_WINDOWS = [
    { mealType: client_1.MealType.BREAKFAST, ...BREAKFAST_AT },
    { mealType: client_1.MealType.LUNCH, ...LUNCH_AT },
    { mealType: client_1.MealType.DINNER, ...DINNER_AT },
];
const WATER_CHECKPOINTS = [
    { hour: 10, minute: 0, ratio: 0.25 },
    { hour: 14, minute: 0, ratio: 0.5 },
    { hour: 18, minute: 0, ratio: 0.75 },
    { hour: 21, minute: 0, ratio: 1 },
];
const getReminderMessage = (mealType) => {
    if (mealType === client_1.MealType.BREAKFAST) {
        return {
            title: 'Ban chua them bua sang',
            message: 'Hay them mon an cho bua sang de theo doi dinh duong trong ngay.',
        };
    }
    if (mealType === client_1.MealType.LUNCH) {
        return {
            title: 'Ban chua them bua trua',
            message: 'Hay them mon an cho bua trua de cap nhat nhat ky an uong.',
        };
    }
    return {
        title: 'Ban chua them bua toi',
        message: 'Hay them mon an cho bua toi de tong hop dinh duong chinh xac hon.',
    };
};
const getNoMealDayMessage = (dateKey) => ({
    title: 'Hom nay chua co bua an nao',
    message: `He thong chua ghi nhan bua an nao trong ngay ${dateKey}. Hay them mon an ngay.`,
});
const getWaterReminderMessage = (remainingMl, goalMl) => ({
    title: 'Nho uong nuoc',
    message: `Ban con thieu ${Math.max(0, remainingMl)}ml nuoc so voi muc tieu ${goalMl}ml hom nay.`,
});
const getAppTimeParts = (date = new Date()) => {
    const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: (0, timezone_util_1.getAppTimeZone)(),
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    }).formatToParts(date);
    const hour = Number(formatted.find((part) => part.type === 'hour')?.value || 0);
    const minute = Number(formatted.find((part) => part.type === 'minute')?.value || 0);
    return { hour, minute };
};
const isAfterTime = (nowHour, nowMinute, thresholdHour, thresholdMinute) => nowHour > thresholdHour || (nowHour === thresholdHour && nowMinute >= thresholdMinute);
const buildReminderKey = (type, dateKey, userId) => `${REMINDER_KEY_PREFIX}:${type}:${dateKey}:${userId}`;
let schedulerTimer = null;
let running = false;
const createNotification = async (userId, title, message, data) => {
    await prisma_1.default.notification.create({
        data: {
            userId,
            title,
            message,
            type: client_1.NotificationType.WARNING,
            data,
        },
    });
};
const markReminderSent = async (key) => {
    await prisma_1.default.systemSetting.upsert({
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
const runMealReminderCycle = async () => {
    if (running)
        return;
    running = true;
    try {
        const now = new Date();
        const dateKey = (0, timezone_util_1.toAppDateKey)(now);
        const { hour, minute } = getAppTimeParts(now);
        const { start, endExclusive } = (0, timezone_util_1.toAppDayRange)(now);
        const users = await prisma_1.default.user.findMany({
            where: { isActive: true, role: 'USER' },
            select: { id: true, email: true, name: true },
        });
        if (users.length === 0)
            return;
        const userIds = users.map((user) => user.id);
        const [mealByTypeRows, totalMealRows, sentRows] = await Promise.all([
            prisma_1.default.meal.groupBy({
                by: ['userId', 'mealType'],
                where: {
                    userId: { in: userIds },
                    eatenAt: { gte: start, lt: endExclusive },
                },
                _count: { _all: true },
            }),
            prisma_1.default.meal.groupBy({
                by: ['userId'],
                where: {
                    userId: { in: userIds },
                    eatenAt: { gte: start, lt: endExclusive },
                },
                _count: { _all: true },
            }),
            prisma_1.default.systemSetting.findMany({
                where: {
                    group: REMINDER_SETTING_GROUP,
                    key: {
                        startsWith: `${REMINDER_KEY_PREFIX}:`,
                        contains: `:${dateKey}:`,
                    },
                },
                select: { key: true },
            }),
        ]);
        const mealCountByType = new Map();
        mealByTypeRows.forEach((row) => {
            mealCountByType.set(`${row.userId}:${row.mealType}`, row._count._all);
        });
        const totalMealCount = new Map();
        totalMealRows.forEach((row) => {
            totalMealCount.set(row.userId, row._count._all);
        });
        const sentKeys = new Set(sentRows.map((row) => row.key));
        for (const user of users) {
            for (const window of REMINDER_WINDOWS) {
                if (!isAfterTime(hour, minute, window.hour, window.minute))
                    continue;
                const mealCount = mealCountByType.get(`${user.id}:${window.mealType}`) || 0;
                if (mealCount > 0)
                    continue;
                const reminderKey = buildReminderKey(`missing_${window.mealType.toLowerCase()}`, dateKey, user.id);
                if (sentKeys.has(reminderKey))
                    continue;
                const message = getReminderMessage(window.mealType);
                await createNotification(user.id, message.title, message.message, {
                    source: 'meal_reminder',
                    reminderType: `missing_${window.mealType.toLowerCase()}`,
                    dateKey,
                });
                sentKeys.add(reminderKey);
                await markReminderSent(reminderKey);
            }
            const [routine, hydration] = await Promise.all([
                (0, personalization_service_1.getPersonalRoutine)(user.id),
                (0, personalization_service_1.getHydrationRecord)(user.id, now),
            ]);
            if (routine.remindersEnabled) {
                for (let index = 0; index < WATER_CHECKPOINTS.length; index++) {
                    const checkpoint = WATER_CHECKPOINTS[index];
                    if (!isAfterTime(hour, minute, checkpoint.hour, checkpoint.minute))
                        continue;
                    const expectedMl = Math.round(routine.waterGoalMl * checkpoint.ratio);
                    if (hydration.totalMl >= expectedMl)
                        continue;
                    const waterKey = buildReminderKey(`water_checkpoint_${index + 1}`, dateKey, user.id);
                    if (sentKeys.has(waterKey))
                        continue;
                    const reminder = getWaterReminderMessage(routine.waterGoalMl - hydration.totalMl, routine.waterGoalMl);
                    await createNotification(user.id, reminder.title, reminder.message, {
                        source: 'hydration_reminder',
                        reminderType: `water_checkpoint_${index + 1}`,
                        dateKey,
                        totalMl: hydration.totalMl,
                        goalMl: routine.waterGoalMl,
                    });
                    sentKeys.add(waterKey);
                    await markReminderSent(waterKey);
                }
            }
            if (!isAfterTime(hour, minute, NO_MEAL_EMAIL_AT.hour, NO_MEAL_EMAIL_AT.minute)) {
                continue;
            }
            const totalMeals = totalMealCount.get(user.id) || 0;
            if (totalMeals > 0)
                continue;
            const noMealNotifyKey = buildReminderKey('no_meal_notification', dateKey, user.id);
            if (!sentKeys.has(noMealNotifyKey)) {
                const message = getNoMealDayMessage(dateKey);
                await createNotification(user.id, message.title, message.message, {
                    source: 'meal_reminder',
                    reminderType: 'no_meal_day',
                    dateKey,
                });
                sentKeys.add(noMealNotifyKey);
                await markReminderSent(noMealNotifyKey);
            }
            const noMealEmailKey = buildReminderKey('no_meal_email', dateKey, user.id);
            if (sentKeys.has(noMealEmailKey))
                continue;
            const mailSent = await (0, email_service_1.sendNoMealReminderEmail)({
                toEmail: user.email,
                userName: user.name,
                dateKey,
            });
            if (mailSent) {
                sentKeys.add(noMealEmailKey);
                await markReminderSent(noMealEmailKey);
            }
        }
    }
    catch (error) {
        console.error('[meal-reminder] scheduler cycle failed:', error);
    }
    finally {
        running = false;
    }
};
const startMealReminderScheduler = () => {
    if (process.env.MEAL_REMINDER_ENABLED === 'false') {
        console.log('[meal-reminder] Scheduler disabled by env.');
        return;
    }
    if (schedulerTimer)
        return;
    const intervalMs = parseIntervalMs();
    schedulerTimer = setInterval(() => {
        void runMealReminderCycle();
    }, intervalMs);
    void runMealReminderCycle();
    console.log(`[meal-reminder] Scheduler started (${intervalMs}ms interval).`);
};
exports.startMealReminderScheduler = startMealReminderScheduler;
const stopMealReminderScheduler = () => {
    if (!schedulerTimer)
        return;
    clearInterval(schedulerTimer);
    schedulerTimer = null;
};
exports.stopMealReminderScheduler = stopMealReminderScheduler;
