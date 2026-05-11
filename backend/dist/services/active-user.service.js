"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveProvider = exports.getActiveWindowMinutes = exports.getActiveUserCount = exports.getActiveUserIds = exports.markUserInactive = exports.markUserActive = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const DEFAULT_ACTIVE_WINDOW_MINUTES = 5;
const DEFAULT_PROVIDER = 'db';
const DB_SETTING_KEY_PREFIX = 'active_user:';
const DB_SETTING_GROUP = 'runtime';
const DB_WRITE_THROTTLE_MS = 60 * 1000;
const parseActiveWindowMinutes = () => {
    const raw = Number(process.env.ACTIVE_USER_WINDOW_MINUTES);
    if (!Number.isFinite(raw) || raw <= 0)
        return DEFAULT_ACTIVE_WINDOW_MINUTES;
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
const userLastSeenMap = new Map();
const userLastPersistedMap = new Map();
const getDbKey = (userId) => `${DB_SETTING_KEY_PREFIX}${userId}`;
const pruneExpiredUsers = (now = Date.now()) => {
    for (const [userId, lastSeenAt] of userLastSeenMap.entries()) {
        if (now - lastSeenAt > ACTIVE_WINDOW_MS) {
            userLastSeenMap.delete(userId);
            userLastPersistedMap.delete(userId);
        }
    }
};
const persistUserActivityToDb = async (userId, seenAt) => {
    await prisma_1.default.systemSetting.upsert({
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
const removeUserActivityFromDb = async (userId) => {
    await prisma_1.default.systemSetting.deleteMany({
        where: { key: getDbKey(userId), group: DB_SETTING_GROUP },
    });
};
const getActiveUserIdsFromDb = async (now = Date.now()) => {
    const rows = await prisma_1.default.systemSetting.findMany({
        where: {
            group: DB_SETTING_GROUP,
            key: { startsWith: DB_SETTING_KEY_PREFIX },
        },
        select: { key: true, value: true },
    });
    const activeIds = [];
    const expiredKeys = [];
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
        }
        else {
            expiredKeys.push(row.key);
            userLastSeenMap.delete(userId);
            userLastPersistedMap.delete(userId);
        }
    });
    if (expiredKeys.length > 0) {
        await prisma_1.default.systemSetting.deleteMany({
            where: {
                group: DB_SETTING_GROUP,
                key: { in: expiredKeys },
            },
        });
    }
    return activeIds;
};
const markUserActive = async (userId, seenAt = Date.now()) => {
    userLastSeenMap.set(userId, seenAt);
    pruneExpiredUsers(seenAt);
    if (ACTIVE_PROVIDER !== 'db')
        return;
    const lastPersistedAt = userLastPersistedMap.get(userId);
    if (lastPersistedAt && seenAt - lastPersistedAt < DB_WRITE_THROTTLE_MS)
        return;
    userLastPersistedMap.set(userId, seenAt);
    await persistUserActivityToDb(userId, seenAt);
};
exports.markUserActive = markUserActive;
const markUserInactive = async (userId) => {
    userLastSeenMap.delete(userId);
    userLastPersistedMap.delete(userId);
    if (ACTIVE_PROVIDER !== 'db')
        return;
    await removeUserActivityFromDb(userId);
};
exports.markUserInactive = markUserInactive;
const getActiveUserIds = async () => {
    if (ACTIVE_PROVIDER === 'memory') {
        pruneExpiredUsers();
        return Array.from(userLastSeenMap.keys());
    }
    return getActiveUserIdsFromDb();
};
exports.getActiveUserIds = getActiveUserIds;
const getActiveUserCount = async () => {
    const activeUserIds = await (0, exports.getActiveUserIds)();
    return activeUserIds.length;
};
exports.getActiveUserCount = getActiveUserCount;
const getActiveWindowMinutes = () => ACTIVE_WINDOW_MINUTES;
exports.getActiveWindowMinutes = getActiveWindowMinutes;
const getActiveProvider = () => ACTIVE_PROVIDER;
exports.getActiveProvider = getActiveProvider;
