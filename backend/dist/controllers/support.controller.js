"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportSessionStatus = exports.sendSupportMessage = exports.getSupportSession = exports.createSupportSession = exports.getSupportSessions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const SUPPORT_PREFIX = 'SUPPORT_';
const STATUS_OPEN = 'SUPPORT_OPEN';
const STATUS_PENDING = 'SUPPORT_PENDING';
const STATUS_CLOSED = 'SUPPORT_CLOSED';
const ALLOWED_STATUSES = new Set([STATUS_OPEN, STATUS_PENDING, STATUS_CLOSED]);
const toPositiveInt = (value) => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isInteger(parsed) || parsed <= 0)
        return null;
    return parsed;
};
const toSessionQuery = (req) => {
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = req.user?.id;
    if (!userId)
        return null;
    if (isAdmin) {
        const requestedUserId = toPositiveInt(req.query.userId);
        const search = String(req.query.search || '').trim();
        return {
            where: {
                status: { startsWith: SUPPORT_PREFIX },
                ...(requestedUserId ? { userId: requestedUserId } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { user: { name: { contains: search, mode: 'insensitive' } } },
                            { user: { email: { contains: search, mode: 'insensitive' } } },
                        ],
                    }
                    : {}),
            },
            isAdmin: true,
            userId,
        };
    }
    return {
        where: {
            userId,
            status: { startsWith: SUPPORT_PREFIX },
        },
        isAdmin: false,
        userId,
    };
};
const getSupportSessions = async (req, res) => {
    try {
        const query = toSessionQuery(req);
        if (!query)
            return res.status(401).json({ error: 'Unauthorized' });
        const sessions = await prisma_1.default.chatSession.findMany({
            where: query.where,
            include: {
                _count: { select: { messages: true } },
                user: { select: { id: true, name: true, email: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { id: true, role: true, content: true, createdAt: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return res.json({ success: true, data: sessions });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Cannot get support sessions' });
    }
};
exports.getSupportSessions = getSupportSessions;
const createSupportSession = async (req, res) => {
    try {
        const authUserId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        if (!authUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        const requestedUserId = toPositiveInt(req.body?.userId);
        const ownerUserId = isAdmin ? requestedUserId || authUserId : authUserId;
        if (!ownerUserId)
            return res.status(400).json({ error: 'userId is required' });
        const titleRaw = String(req.body?.title || '').trim();
        const title = titleRaw || 'Ho tro khach hang';
        if (!isAdmin) {
            const existing = await prisma_1.default.chatSession.findFirst({
                where: {
                    userId: ownerUserId,
                    status: { in: [STATUS_OPEN, STATUS_PENDING] },
                },
                orderBy: { updatedAt: 'desc' },
            });
            if (existing) {
                return res.json({ success: true, data: existing });
            }
        }
        const session = await prisma_1.default.chatSession.create({
            data: {
                userId: ownerUserId,
                title,
                status: STATUS_OPEN,
            },
        });
        return res.status(201).json({ success: true, data: session });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Cannot create support session' });
    }
};
exports.createSupportSession = createSupportSession;
const getSupportSession = async (req, res) => {
    try {
        const sessionId = toPositiveInt(req.params.id);
        const authUserId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
        if (!authUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        const session = await prisma_1.default.chatSession.findFirst({
            where: {
                id: sessionId,
                status: { startsWith: SUPPORT_PREFIX },
                ...(isAdmin ? {} : { userId: authUserId }),
            },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                user: { select: { id: true, name: true, email: true } },
            },
        });
        if (!session)
            return res.status(404).json({ error: 'Support session not found' });
        return res.json({ success: true, data: session });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Cannot get support session' });
    }
};
exports.getSupportSession = getSupportSession;
const sendSupportMessage = async (req, res) => {
    try {
        const sessionId = toPositiveInt(req.params.id);
        const authUserId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        const content = String(req.body?.content || '').trim();
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
        if (!authUserId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!content)
            return res.status(400).json({ error: 'Message content is required' });
        const session = await prisma_1.default.chatSession.findFirst({
            where: {
                id: sessionId,
                status: { startsWith: SUPPORT_PREFIX },
                ...(isAdmin ? {} : { userId: authUserId }),
            },
            select: { id: true, userId: true, status: true },
        });
        if (!session)
            return res.status(404).json({ error: 'Support session not found' });
        const role = isAdmin ? 'ADMIN' : 'USER';
        const nextStatus = isAdmin ? STATUS_OPEN : STATUS_PENDING;
        const message = await prisma_1.default.chatMessage.create({
            data: {
                sessionId: session.id,
                role,
                content,
            },
        });
        await prisma_1.default.chatSession.update({
            where: { id: session.id },
            data: {
                updatedAt: new Date(),
                status: session.status === STATUS_CLOSED ? STATUS_OPEN : nextStatus,
            },
        });
        return res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Cannot send support message' });
    }
};
exports.sendSupportMessage = sendSupportMessage;
const updateSupportSessionStatus = async (req, res) => {
    try {
        const sessionId = toPositiveInt(req.params.id);
        const isAdmin = req.user?.role === 'ADMIN';
        const nextStatus = String(req.body?.status || '').trim().toUpperCase();
        if (!isAdmin)
            return res.status(403).json({ error: 'Only admin can update support status' });
        if (!sessionId)
            return res.status(400).json({ error: 'Invalid session id' });
        if (!ALLOWED_STATUSES.has(nextStatus)) {
            return res.status(400).json({ error: 'Invalid support status' });
        }
        const updated = await prisma_1.default.chatSession.updateMany({
            where: {
                id: sessionId,
                status: { startsWith: SUPPORT_PREFIX },
            },
            data: {
                status: nextStatus,
                updatedAt: new Date(),
            },
        });
        if (updated.count === 0) {
            return res.status(404).json({ error: 'Support session not found' });
        }
        const session = await prisma_1.default.chatSession.findUnique({ where: { id: sessionId } });
        return res.json({ success: true, data: session });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Cannot update support status' });
    }
};
exports.updateSupportSessionStatus = updateSupportSessionStatus;
