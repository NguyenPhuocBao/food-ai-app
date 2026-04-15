import { GoalType, PrismaClient } from '@prisma/client';
import { toAppDateKey, toAppDayRange, shiftAppDays } from '../utils/timezone.util';
import { normalizeGoalCalories } from './health-engine.service';

const prisma = new PrismaClient();

const ROUTINE_GROUP = 'personalization';
const ROUTINE_KEY_PREFIX = 'routine';
const HYDRATION_GROUP = 'hydration';
const HYDRATION_KEY_PREFIX = 'hydration';

export type PersonalRoutine = {
  wakeUpAt: string;
  sleepAt: string;
  breakfastAt: string;
  lunchAt: string;
  dinnerAt: string;
  waterGoalMl: number;
  remindersEnabled: boolean;
};

export type HydrationLogItem = {
  amountMl: number;
  loggedAt: string;
};

export type HydrationRecord = {
  dateKey: string;
  totalMl: number;
  logs: HydrationLogItem[];
};

const DEFAULT_ROUTINE: PersonalRoutine = {
  wakeUpAt: '06:30',
  sleepAt: '23:00',
  breakfastAt: '07:30',
  lunchAt: '12:30',
  dinnerAt: '19:00',
  waterGoalMl: 2200,
  remindersEnabled: true,
};

const activityFactor: Record<string, number> = {
  SEDENTARY: 1,
  LIGHT: 1.05,
  MODERATE: 1.12,
  ACTIVE: 1.2,
  VERY_ACTIVE: 1.28,
};

const goalAdjustment: Record<GoalType, number> = {
  WEIGHT_LOSS: -320,
  MAINTENANCE: 0,
  WEIGHT_GAIN: 260,
  MUSCLE_GAIN: 180,
};

const safeJsonParse = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getRoutineKey = (userId: number) => `${ROUTINE_KEY_PREFIX}:${userId}`;
const getHydrationKey = (userId: number, dateKey: string) => `${HYDRATION_KEY_PREFIX}:${dateKey}:${userId}`;

const normalizeTimeText = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  ) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  return fallback;
};

const normalizeRoutine = (input?: Partial<PersonalRoutine> | null): PersonalRoutine => {
  if (!input) return { ...DEFAULT_ROUTINE };

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

export const getPersonalRoutine = async (userId: number): Promise<PersonalRoutine> => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: getRoutineKey(userId) },
    select: { value: true },
  });

  return normalizeRoutine(safeJsonParse<Partial<PersonalRoutine>>(setting?.value, DEFAULT_ROUTINE));
};

export const updatePersonalRoutine = async (userId: number, payload: Partial<PersonalRoutine>) => {
  const current = await getPersonalRoutine(userId);
  const nextValue = normalizeRoutine({ ...current, ...payload });

  await prisma.systemSetting.upsert({
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

export const getHydrationRecord = async (userId: number, date: Date | string = new Date()): Promise<HydrationRecord> => {
  const dateKey = toAppDateKey(date);
  const setting = await prisma.systemSetting.findUnique({ where: { key: getHydrationKey(userId, dateKey) } });

  const parsed = safeJsonParse<HydrationRecord>(setting?.value, {
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

export const addHydrationLog = async (
  userId: number,
  amountMl: number,
  loggedAt: Date | string = new Date()
): Promise<HydrationRecord> => {
  const normalizedAmount = Math.max(50, Math.min(1200, Math.round(amountMl || 250)));
  const dateKey = toAppDateKey(loggedAt);
  const key = getHydrationKey(userId, dateKey);

  const current = await getHydrationRecord(userId, loggedAt);
  const logs = [
    ...current.logs,
    {
      amountMl: normalizedAmount,
      loggedAt: new Date(loggedAt).toISOString(),
    },
  ].slice(-30);

  const nextValue: HydrationRecord = {
    dateKey,
    totalMl: current.totalMl + normalizedAmount,
    logs,
  };

  await prisma.systemSetting.upsert({
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

export const getHydrationSummaryForRange = async (
  userId: number,
  startDate: Date,
  endExclusive: Date
) => {
  const keys: string[] = [];
  let cursor = new Date(startDate);
  while (cursor < endExclusive) {
    keys.push(getHydrationKey(userId, toAppDateKey(cursor)));
    cursor = shiftAppDays(cursor, 1);
  }

  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: keys }, group: HYDRATION_GROUP },
    select: { key: true, value: true },
  });

  const totalMl = rows.reduce((sum, row) => {
    const parsed = safeJsonParse<HydrationRecord>(row.value, {
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

export const resolvePersonalTargets = async (userId: number) => {
  const [profile, goal, routine] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.userGoal.findFirst({ where: { userId, isActive: true }, orderBy: { startDate: 'desc' } }),
    getPersonalRoutine(userId),
  ]);

  const activity = profile?.activityLevel || 'MODERATE';
  const goalType = goal?.goalType || 'MAINTENANCE';

  const baseCalories = normalizeGoalCalories(goal?.targetCalories || profile?.targetCalories || 2000);
  const adjustedCalories = Math.round(baseCalories * (activityFactor[activity] || 1) + goalAdjustment[goalType]);
  const targetCalories = normalizeGoalCalories(adjustedCalories);

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

export const getTodayMealWindow = async (userId: number, date: Date | string = new Date()) => {
  const routine = await getPersonalRoutine(userId);
  const { start, endExclusive } = toAppDayRange(date);

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
        },
      },
    },
  });

  return { routine, meals };
};

export const PERSONALIZATION_KEYS = {
  ROUTINE_GROUP,
  ROUTINE_KEY_PREFIX,
  HYDRATION_GROUP,
  HYDRATION_KEY_PREFIX,
  getHydrationKey,
};
