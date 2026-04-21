"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopReviewReplyRetentionScheduler = exports.startReviewReplyRetentionScheduler = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000;
let retentionTimer = null;
let running = false;
const parseRetentionDays = () => {
    const raw = Number(process.env.REVIEW_REPLY_RETENTION_DAYS || DEFAULT_RETENTION_DAYS);
    if (!Number.isFinite(raw) || raw < 1)
        return DEFAULT_RETENTION_DAYS;
    return Math.floor(raw);
};
const parseIntervalMs = () => {
    const raw = Number(process.env.REVIEW_REPLY_RETENTION_INTERVAL_MS || DEFAULT_INTERVAL_MS);
    if (!Number.isFinite(raw) || raw < 60000)
        return DEFAULT_INTERVAL_MS;
    return Math.floor(raw);
};
const getCutoffDate = (retentionDays) => {
    const now = Date.now();
    return new Date(now - retentionDays * 24 * 60 * 60 * 1000);
};
const runReviewReplyRetentionCycle = async () => {
    if (running)
        return;
    running = true;
    try {
        const retentionDays = parseRetentionDays();
        const cutoff = getCutoffDate(retentionDays);
        const result = await prisma_1.default.reviewReply.deleteMany({
            where: {
                createdAt: { lt: cutoff },
            },
        });
        if (result.count > 0) {
            console.log(`[review-retention] Deleted ${result.count} review replies older than ${retentionDays} days.`);
        }
    }
    catch (error) {
        console.error('[review-retention] cleanup cycle failed:', error);
    }
    finally {
        running = false;
    }
};
const startReviewReplyRetentionScheduler = () => {
    if (process.env.REVIEW_REPLY_RETENTION_ENABLED === 'false') {
        console.log('[review-retention] Scheduler disabled by env.');
        return;
    }
    if (retentionTimer)
        return;
    const intervalMs = parseIntervalMs();
    retentionTimer = setInterval(() => {
        void runReviewReplyRetentionCycle();
    }, intervalMs);
    void runReviewReplyRetentionCycle();
    console.log(`[review-retention] Scheduler started (${intervalMs}ms interval).`);
};
exports.startReviewReplyRetentionScheduler = startReviewReplyRetentionScheduler;
const stopReviewReplyRetentionScheduler = () => {
    if (!retentionTimer)
        return;
    clearInterval(retentionTimer);
    retentionTimer = null;
};
exports.stopReviewReplyRetentionScheduler = stopReviewReplyRetentionScheduler;
