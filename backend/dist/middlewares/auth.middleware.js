"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const active_user_service_1 = require("../services/active-user.service");
const JWT_SECRET = process.env.JWT_SECRET || 'food-ai-secret-key-2024';
const prisma = new client_1.PrismaClient();
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
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
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
