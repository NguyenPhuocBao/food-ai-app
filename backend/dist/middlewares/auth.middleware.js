"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerOrAdminMiddleware = exports.adminMiddleware = exports.authMiddlewareAllowQueryToken = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const active_user_service_1 = require("../services/active-user.service");
const jwt_util_1 = require("../utils/jwt.util");
const prisma_1 = __importDefault(require("../lib/prisma"));
const authenticateRequest = async (req, res, next, token) => {
    try {
        const jwtSecret = (0, jwt_util_1.resolveJwtSecret)();
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, isActive: true, passwordChangedAt: true },
        });
        if (!user || !user.isActive) {
            return res.status(403).json({ error: 'Forbidden: Account is inactive' });
        }
        if (user.passwordChangedAt &&
            decoded.iat &&
            decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
            return res.status(401).json({ error: 'Unauthorized: Token has expired' });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        void (0, active_user_service_1.markUserActive)(user.id).catch(() => {
            // Ignore tracking failures to avoid blocking authenticated requests.
        });
        next();
    }
    catch (error) {
        if (error?.message?.startsWith('Server auth misconfigured:')) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    return authenticateRequest(req, res, next, token);
};
exports.authMiddleware = authMiddleware;
const authMiddlewareAllowQueryToken = async (req, res, next) => {
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token : undefined;
    return authenticateRequest(req, res, next, tokenFromHeader || tokenFromQuery);
};
exports.authMiddlewareAllowQueryToken = authMiddlewareAllowQueryToken;
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const trainerOrAdminMiddleware = (req, res, next) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'PT')) {
        return res.status(403).json({ error: 'Forbidden: PT access required' });
    }
    next();
};
exports.trainerOrAdminMiddleware = trainerOrAdminMiddleware;
