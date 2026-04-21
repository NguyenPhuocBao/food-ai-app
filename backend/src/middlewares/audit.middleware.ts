import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

type AuthRequestLike = Request & {
  user?: {
    id: number;
    role?: string;
    email?: string;
  };
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'refreshToken',
  'authorization',
  'secret',
  'otp',
]);

const MANUAL_AUDIT_ROUTES: Array<{ method: string; pattern: RegExp }> = [
  { method: 'ANY', pattern: /^\/api\/auth(?:\/|$)/i },
  { method: 'PUT', pattern: /^\/api\/admin\/users\/\d+\/role$/i },
  { method: 'DELETE', pattern: /^\/api\/admin\/users\/\d+$/i },
  { method: 'POST', pattern: /^\/api\/admin\/foods$/i },
  { method: 'PUT', pattern: /^\/api\/admin\/foods\/\d+$/i },
  { method: 'DELETE', pattern: /^\/api\/admin\/foods\/\d+$/i },
  { method: 'PUT', pattern: /^\/api\/admin\/users\/\d+\/ban$/i },
  { method: 'PUT', pattern: /^\/api\/admin\/users\/\d+\/reset-password$/i },
  { method: 'PUT', pattern: /^\/api\/admin\/users\/\d+\/profile$/i },
  { method: 'POST', pattern: /^\/api\/admin\/notifications\/send-to-user\/\d+$/i },
  { method: 'POST', pattern: /^\/api\/admin\/notifications\/send-to-multiple$/i },
  { method: 'POST', pattern: /^\/api\/admin\/notifications\/broadcast$/i },
  { method: 'POST', pattern: /^\/api\/admin\/broadcast$/i },
];

const normalizePath = (url: string) => String(url || '').split('?')[0] || '';

const toEntityLabel = (resource: string) => {
  const map: Record<string, string> = {
    users: 'User',
    foods: 'FoodItem',
    meals: 'Meal',
    favorites: 'Favorite',
    reviews: 'Review',
    notifications: 'Notification',
    recipes: 'Recipe',
    chat: 'Chat',
    analyze: 'Analyze',
    'meal-plans': 'MealPlan',
    recommendations: 'Recommendation',
    'weekly-reports': 'WeeklyReport',
    settings: 'SystemSetting',
    health: 'Health',
    statistics: 'Statistics',
  };

  if (map[resource]) return map[resource];
  const normalized = resource.replace(/-/g, ' ');
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join('') || 'Unknown';
};

const inferEntity = (pathWithoutQuery: string) => {
  const segments = pathWithoutQuery.split('/').filter(Boolean);
  if (segments.length < 2) return 'Unknown';

  const apiIndex = segments[0] === 'api' ? 1 : 0;
  const module = segments[apiIndex];

  if (module === 'admin') {
    const resource = segments[apiIndex + 1] || 'Admin';

    if (resource === 'users' && segments.includes('meal-plans')) return 'MealPlan';
    if (resource === 'meals') return 'Meal';
    if (resource === 'settings') return 'SystemSetting';

    return toEntityLabel(resource);
  }

  return toEntityLabel(module);
};

const inferEntityId = (params: Record<string, unknown>) => {
  const keys = ['id', 'userId', 'foodId', 'mealId', 'reviewId', 'recipeId', 'planId'];
  for (const key of keys) {
    if (params[key] === undefined || params[key] === null) continue;
    const parsed = Number.parseInt(String(params[key]), 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
};

const toSafeValue = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return value;
  if (depth > 4) return '[TRUNCATED_DEPTH]';

  if (typeof value === 'string') {
    return value.length > 500 ? `${value.slice(0, 500)}...[TRUNCATED]` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    const capped = value.slice(0, 30).map((item) => toSafeValue(item, depth + 1));
    if (value.length > 30) capped.push(`[+${value.length - 30} items]` as unknown);
    return capped;
  }

  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const entries = Object.entries(input).slice(0, 40);
    const output: Record<string, unknown> = {};

    for (const [key, entryValue] of entries) {
      if (SENSITIVE_KEYS.has(key)) {
        output[key] = '[REDACTED]';
        continue;
      }
      output[key] = toSafeValue(entryValue, depth + 1);
    }

    if (Object.keys(input).length > 40) {
      output.__truncatedKeys = Object.keys(input).length - 40;
    }

    return output;
  }

  return String(value);
};

const shouldSkipAutoAudit = (method: string, pathWithoutQuery: string) => {
  if (!MUTATING_METHODS.has(method)) return true;
  if (!pathWithoutQuery.startsWith('/api/')) return true;
  if (pathWithoutQuery.startsWith('/api/admin/audit-logs')) return true;

  return MANUAL_AUDIT_ROUTES.some((rule) => {
    if (rule.method !== 'ANY' && rule.method !== method) return false;
    return rule.pattern.test(pathWithoutQuery);
  });
};

export const auditMutationMiddleware = (req: AuthRequestLike, res: Response, next: NextFunction) => {
  const method = req.method.toUpperCase();
  const pathWithoutQuery = normalizePath(req.originalUrl || req.url || '');
  const requestStartedAt = Date.now();

  res.on('finish', () => {
    try {
      if (res.statusCode >= 400) return;
      if (shouldSkipAutoAudit(method, pathWithoutQuery)) return;
      if (!req.user?.id) return;

      const entity = inferEntity(pathWithoutQuery);
      const baseAction = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
      const action = `${baseAction}_${entity.toUpperCase()}`;
      const entityId = inferEntityId((req.params || {}) as Record<string, unknown>);

      const newData = toSafeValue({
        method,
        path: pathWithoutQuery,
        params: req.params,
        query: req.query,
        body: req.body,
        statusCode: res.statusCode,
        durationMs: Date.now() - requestStartedAt,
      });

      void prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action,
          entity,
          entityId,
          newData: newData as any,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }).catch((error) => {
        console.error('[audit] failed to write audit log:', error);
      });
    } catch (error) {
      console.error('[audit] middleware failed:', error);
    }
  });

  next();
};
