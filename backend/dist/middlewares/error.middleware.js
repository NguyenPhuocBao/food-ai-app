"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
