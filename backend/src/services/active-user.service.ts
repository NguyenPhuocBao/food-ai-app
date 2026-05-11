import prisma from '../lib/prisma';

const DEFAULT_ACTIVE_WINDOW_MINUTES = 5;
const DEFAULT_PROVIDER = 'db';
const DB_SETTING_KEY_PREFIX = 'active_user:';
const DB_SETTING_GROUP = 'runtime';
const DB_WRITE_THROTTLE_MS = 60 * 1000;

const parseActiveWindowMinutes = () => {
  const raw = Number(process.env.ACTIVE_USER_WINDOW_MINUTES);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_ACTIVE_WINDOW_MINUTES;
  return raw;
};

const parseProvider = () => {
  const provider = (process.env.ACTIVE_USER_PROVIDER || DEFAULT_PROVIDER).trim().toLowerCase();
  return provider === 'memory' ? 'memory' : 'db';
};

const ACTIVE_WINDOW_MINUTES = parseActiveWindowMinutes();
const ACTIVE_WINDOW_MS = ACTIVE_WINDOW_MINUTES * 60 * 1000;
const ACTIVE_PROVIDER = parseProvider();

// Fast local cache (also used directly when provider=memory)
const userLastSeenMap = new Map<number, number>();
const userLastPersistedMap = new Map<number, number>();

const getDbKey = (userId: number) => `${DB_SETTING_KEY_PREFIX}${userId}`;

const pruneExpiredUsers = (now = Date.now()) => {
  for (const [userId, lastSeenAt] of userLastSeenMap.entries()) {
    if (now - lastSeenAt > ACTIVE_WINDOW_MS) {
      userLastSeenMap.delete(userId);
      userLastPersistedMap.delete(userId);
    }
  }
};

const persistUserActivityToDb = async (userId: number, seenAt: number) => {
  await prisma.systemSetting.upsert({
    where: { key: getDbKey(userId) },
    update: {
      value: String(seenAt),
      group: DB_SETTING_GROUP,
    },
    create: {
      key: getDbKey(userId),
      value: String(seenAt),
      group: DB_SETTING_GROUP,
    },
  });
};

const removeUserActivityFromDb = async (userId: number) => {
  await prisma.systemSetting.deleteMany({
    where: { key: getDbKey(userId), group: DB_SETTING_GROUP },
  });
};

const getActiveUserIdsFromDb = async (now = Date.now()) => {
  const rows = await prisma.systemSetting.findMany({
    where: {
      group: DB_SETTING_GROUP,
      key: { startsWith: DB_SETTING_KEY_PREFIX },
    },
    select: { key: true, value: true },
  });

  const activeIds: number[] = [];
  const expiredKeys: string[] = [];

  rows.forEach((row) => {
    const userId = Number(row.key.replace(DB_SETTING_KEY_PREFIX, ''));
    const lastSeenAt = Number(row.value);

    if (!Number.isFinite(userId) || !Number.isFinite(lastSeenAt)) {
      expiredKeys.push(row.key);
      return;
    }

    if (now - lastSeenAt <= ACTIVE_WINDOW_MS) {
      activeIds.push(userId);
      userLastSeenMap.set(userId, lastSeenAt);
      userLastPersistedMap.set(userId, lastSeenAt);
    } else {
      expiredKeys.push(row.key);
      userLastSeenMap.delete(userId);
      userLastPersistedMap.delete(userId);
    }
  });

  if (expiredKeys.length > 0) {
    await prisma.systemSetting.deleteMany({
      where: {
        group: DB_SETTING_GROUP,
        key: { in: expiredKeys },
      },
    });
  }

  return activeIds;
};

export const markUserActive = async (userId: number, seenAt = Date.now()) => {
  userLastSeenMap.set(userId, seenAt);
  pruneExpiredUsers(seenAt);

  if (ACTIVE_PROVIDER !== 'db') return;

  const lastPersistedAt = userLastPersistedMap.get(userId);
  if (lastPersistedAt && seenAt - lastPersistedAt < DB_WRITE_THROTTLE_MS) return;

  userLastPersistedMap.set(userId, seenAt);
  await persistUserActivityToDb(userId, seenAt);
};

export const markUserInactive = async (userId: number) => {
  userLastSeenMap.delete(userId);
  userLastPersistedMap.delete(userId);

  if (ACTIVE_PROVIDER !== 'db') return;

  await removeUserActivityFromDb(userId);
};

export const getActiveUserIds = async () => {
  if (ACTIVE_PROVIDER === 'memory') {
    pruneExpiredUsers();
    return Array.from(userLastSeenMap.keys());
  }

  return getActiveUserIdsFromDb();
};

export const getActiveUserCount = async () => {
  const activeUserIds = await getActiveUserIds();
  return activeUserIds.length;
};

export const getActiveWindowMinutes = () => ACTIVE_WINDOW_MINUTES;
export const getActiveProvider = () => ACTIVE_PROVIDER;
