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

    if (status < 400) {
      console.log(`[api] ${method} ${path} -> ${status} (${durationMs}ms)`);
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
      `[api-error] ${method} ${path} -> ${status} (${durationMs}ms) | ${truncate(safeStringify(payload))}`,
    );
  });

  next();
};
