import { NextFunction, Request, Response } from 'express';

type ResponseBodySnapshot = {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: unknown;
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const truncate = (value: string, max = 800) => (value.length > max ? `${value.slice(0, max)}...` : value);

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  white: '\x1b[37m',
};

const colorize = (value: string, color: string) => `${color}${value}${ANSI.reset}`;

const getStatusColor = (status: number) => {
  if (status >= 500) return ANSI.brightRed;
  if (status >= 400) return ANSI.yellow;
  if (status >= 300) return ANSI.cyan;
  if (status >= 200) return ANSI.green;
  return ANSI.white;
};

export const errorResponseLogger = (req: Request, res: Response, next: NextFunction) => {
  let responseBody: ResponseBodySnapshot | undefined;
  const startedAt = Date.now();

  const originalJson = res.json.bind(res);
  res.json = ((body: ResponseBodySnapshot) => {
    responseBody = body;
    return originalJson(body);
  }) as Response['json'];

  res.on('finish', () => {
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;
    const durationMs = Date.now() - startedAt;
    const statusColor = getStatusColor(status);
    const methodLabel = colorize(method.padEnd(7, ' '), ANSI.white);
    const statusLabel = colorize(String(status), statusColor);
    const durationLabel = colorize(`${durationMs}ms`, ANSI.dim);

    if (status < 400) {
      console.log(`[api] ${methodLabel} ${path} -> ${statusLabel} (${durationLabel})`);
      return;
    }

    const message = responseBody?.error || responseBody?.message || 'Unknown error';

    const payload = {
      method,
      path,
      status,
      durationMs,
      message,
      query: req.query,
      body:
        method === 'GET' || method === 'HEAD'
          ? undefined
          : req.body,
      response: responseBody,
    };

    console.error(
      `${colorize('[api-error]', ANSI.red)} ${methodLabel} ${path} -> ${statusLabel} (${durationLabel}) | ${truncate(safeStringify(payload))}`,
    );
  });

  next();
};
