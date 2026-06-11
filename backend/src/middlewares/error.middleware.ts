import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  console.error('[error-handler]', {
    method: req.method,
    path: req.originalUrl || req.url,
    status,
    message: err?.message || 'Internal Server Error',
    stack: err?.stack,
  });

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
