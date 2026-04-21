"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimit = void 0;
const buckets = new Map();
let lastCleanupAt = Date.now();
const CLEANUP_INTERVAL_MS = 60 * 1000;
const cleanupExpiredBuckets = (now, windowMs) => {
    if (now - lastCleanupAt < CLEANUP_INTERVAL_MS)
        return;
    lastCleanupAt = now;
    for (const [key, bucket] of buckets.entries()) {
        if (now - bucket.startedAt > windowMs * 2) {
            buckets.delete(key);
        }
    }
};
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0];
    }
    return req.ip || 'unknown';
};
const createRateLimit = (config) => {
    const { windowMs, max, keyPrefix, message } = config;
    const errorMessage = message || 'Too many requests, please try again later.';
    return (req, res, next) => {
        const now = Date.now();
        cleanupExpiredBuckets(now, windowMs);
        const key = `${keyPrefix}:${getClientIp(req)}`;
        const bucket = buckets.get(key);
        if (!bucket || now - bucket.startedAt > windowMs) {
            buckets.set(key, { count: 1, startedAt: now });
            return next();
        }
        if (bucket.count >= max) {
            const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
            res.setHeader('Retry-After', String(retryAfterSeconds));
            return res.status(429).json({ error: errorMessage });
        }
        bucket.count += 1;
        buckets.set(key, bucket);
        return next();
    };
};
exports.createRateLimit = createRateLimit;
