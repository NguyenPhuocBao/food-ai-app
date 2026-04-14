import { MealType, NotificationType, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { getAppTimeZone, toAppDateKey, toAppDayRange } from '../utils/timezone.util';
import { sendNoMealReminderEmail } from './email.service';

type ReminderWindow = {
  mealType: MealType;
  hour: number;
  minute: number;
};

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const REMINDER_SETTING_GROUP = 'runtime';
const REMINDER_KEY_PREFIX = 'meal_reminder';

const parseIntervalMs = () => {
  const raw = Number(process.env.MEAL_REMINDER_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  if (!Number.isFinite(raw) || raw < 60_000) return DEFAULT_INTERVAL_MS;
  return raw;
};

const parseTime = (value: string, fallbackHour: number, fallbackMinute: number) => {
  const [hourText, minuteText] = (value || '').split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: fallbackHour, minute: fallbackMinute };
  }

  return { hour, minute };
};

const BREAKFAST_AT = parseTime(process.env.BREAKFAST_REMINDER_AT || '', 9, 30);
const LUNCH_AT = parseTime(process.env.LUNCH_REMINDER_AT || '', 13, 30);
const DINNER_AT = parseTime(process.env.DINNER_REMINDER_AT || '', 20, 0);
const NO_MEAL_EMAIL_AT = parseTime(process.env.NO_MEAL_EMAIL_AT || '', 21, 30);

const REMINDER_WINDOWS: ReminderWindow[] = [
  { mealType: MealType.BREAKFAST, ...BREAKFAST_AT },
  { mealType: MealType.LUNCH, ...LUNCH_AT },
  { mealType: MealType.DINNER, ...DINNER_AT },
];

const getReminderMessage = (mealType: MealType) => {
  if (mealType === MealType.BREAKFAST) {
    return {
      title: 'Ban chua them bua sang',
      message: 'Hay them mon an cho bua sang de theo doi dinh duong trong ngay.',
    };
  }
  if (mealType === MealType.LUNCH) {
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

const getNoMealDayMessage = (dateKey: string) => ({
  title: 'Hom nay chua co bua an nao',
  message: `He thong chua ghi nhan bua an nao trong ngay ${dateKey}. Hay them mon an ngay.`,
});

const getAppTimeParts = (date = new Date()) => {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: getAppTimeZone(),
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date);

  const hour = Number(formatted.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(formatted.find((part) => part.type === 'minute')?.value || 0);
  return { hour, minute };
};

const isAfterTime = (
  nowHour: number,
  nowMinute: number,
  thresholdHour: number,
  thresholdMinute: number
) => nowHour > thresholdHour || (nowHour === thresholdHour && nowMinute >= thresholdMinute);

const buildReminderKey = (type: string, dateKey: string, userId: number) =>
  `${REMINDER_KEY_PREFIX}:${type}:${dateKey}:${userId}`;

let schedulerTimer: NodeJS.Timeout | null = null;
let running = false;

const createNotification = async (
  userId: number,
  title: string,
  message: string,
  data: Prisma.InputJsonValue
) => {
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: NotificationType.WARNING,
      data,
    },
  });
};

const markReminderSent = async (key: string) => {
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

const runMealReminderCycle = async () => {
  if (running) return;
  running = true;

  try {
    const now = new Date();
    const dateKey = toAppDateKey(now);
    const { hour, minute } = getAppTimeParts(now);
    const { start, endExclusive } = toAppDayRange(now);

    const users = await prisma.user.findMany({
      where: { isActive: true, role: 'USER' },
      select: { id: true, email: true, name: true },
    });
    if (users.length === 0) return;

    const userIds = users.map((user) => user.id);

    const [mealByTypeRows, totalMealRows, sentRows] = await Promise.all([
      prisma.meal.groupBy({
        by: ['userId', 'mealType'],
        where: {
          userId: { in: userIds },
          eatenAt: { gte: start, lt: endExclusive },
        },
        _count: { _all: true },
      }),
      prisma.meal.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          eatenAt: { gte: start, lt: endExclusive },
        },
        _count: { _all: true },
      }),
      prisma.systemSetting.findMany({
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

    const mealCountByType = new Map<string, number>();
    mealByTypeRows.forEach((row) => {
      mealCountByType.set(`${row.userId}:${row.mealType}`, row._count._all);
    });

    const totalMealCount = new Map<number, number>();
    totalMealRows.forEach((row) => {
      totalMealCount.set(row.userId, row._count._all);
    });

    const sentKeys = new Set(sentRows.map((row) => row.key));

    for (const user of users) {
      for (const window of REMINDER_WINDOWS) {
        if (!isAfterTime(hour, minute, window.hour, window.minute)) continue;

        const mealCount = mealCountByType.get(`${user.id}:${window.mealType}`) || 0;
        if (mealCount > 0) continue;

        const reminderKey = buildReminderKey(`missing_${window.mealType.toLowerCase()}`, dateKey, user.id);
        if (sentKeys.has(reminderKey)) continue;

        const message = getReminderMessage(window.mealType);
        await createNotification(user.id, message.title, message.message, {
          source: 'meal_reminder',
          reminderType: `missing_${window.mealType.toLowerCase()}`,
          dateKey,
        });

        sentKeys.add(reminderKey);
        await markReminderSent(reminderKey);
      }

      if (!isAfterTime(hour, minute, NO_MEAL_EMAIL_AT.hour, NO_MEAL_EMAIL_AT.minute)) {
        continue;
      }

      const totalMeals = totalMealCount.get(user.id) || 0;
      if (totalMeals > 0) continue;

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
      if (sentKeys.has(noMealEmailKey)) continue;

      const mailSent = await sendNoMealReminderEmail({
        toEmail: user.email,
        userName: user.name,
        dateKey,
      });

      if (mailSent) {
        sentKeys.add(noMealEmailKey);
        await markReminderSent(noMealEmailKey);
      }
    }
  } catch (error) {
    console.error('[meal-reminder] scheduler cycle failed:', error);
  } finally {
    running = false;
  }
};

export const startMealReminderScheduler = () => {
  if (process.env.MEAL_REMINDER_ENABLED === 'false') {
    console.log('[meal-reminder] Scheduler disabled by env.');
    return;
  }
  if (schedulerTimer) return;

  const intervalMs = parseIntervalMs();
  schedulerTimer = setInterval(() => {
    void runMealReminderCycle();
  }, intervalMs);

  void runMealReminderCycle();
  console.log(`[meal-reminder] Scheduler started (${intervalMs}ms interval).`);
};

export const stopMealReminderScheduler = () => {
  if (!schedulerTimer) return;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
};
