import { z } from 'zod';

type NodeEnv = 'development' | 'test' | 'production';

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

const normalizeNodeEnv = (value?: string): NodeEnv => {
  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }
  return 'development';
};

const parsePort = (value?: string) => {
  if (!value) return 5000;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return parsed;
};

const assertHttpUrl = (label: string, value: string) => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${label} must start with http:// or https://.`);
  }
};

const parseCorsOrigins = (raw: string, fallback: string) => {
  const source = raw.trim() ? raw : fallback;
  const origins = source
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return [fallback];
  }

  origins.forEach((origin) => {
    if (origin === '*') return;
    assertHttpUrl('CORS_ORIGIN', origin);
  });

  return origins;
};

export type RuntimeEnv = {
  nodeEnv: NodeEnv;
  port: number;
  databaseUrl: string;
  frontendUrl: string;
  corsOrigins: string[];
};

let runtimeEnvCache: RuntimeEnv | null = null;

export const getRuntimeEnv = (): RuntimeEnv => {
  if (runtimeEnvCache) return runtimeEnvCache;

  const parsed = envSchema.parse(process.env);
  const nodeEnv = normalizeNodeEnv(parsed.NODE_ENV);
  const port = parsePort(parsed.PORT);

  const databaseUrl = String(parsed.DATABASE_URL || '').trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  const frontendUrl = String(parsed.FRONTEND_URL || DEFAULT_FRONTEND_URL).trim();
  assertHttpUrl('FRONTEND_URL', frontendUrl);

  const corsOrigins = parseCorsOrigins(String(parsed.CORS_ORIGIN || ''), frontendUrl);

  runtimeEnvCache = {
    nodeEnv,
    port,
    databaseUrl,
    frontendUrl,
    corsOrigins,
  };

  return runtimeEnvCache;
};

