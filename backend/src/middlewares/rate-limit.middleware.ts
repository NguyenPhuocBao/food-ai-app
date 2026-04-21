import { Request, Response, NextFunction } from 'express';

type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
};

type RateBucket = {
  count: number;
  startedAt: number;
};

const buckets = new Map<string, RateBucket>();
let lastCleanupAt = Date.now();

const CLEANUP_INTERVAL_MS = 60 * 1000;

const cleanupExpiredBuckets = (now: number, windowMs: number) => {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.startedAt > windowMs * 2) {
      buckets.delete(key);
    }
  }
};

const getClientIp = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.ip || 'unknown';
};

export const createRateLimit = (config: RateLimitConfig) => {
  const { windowMs, max, keyPrefix, message } = config;
  const errorMessage = message || 'Too many requests, please try again later.';

  return (req: Request, res: Response, next: NextFunction) => {
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
