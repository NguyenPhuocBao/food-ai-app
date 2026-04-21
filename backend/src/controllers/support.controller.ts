import { Request, Response } from 'express';
import prisma from '../lib/prisma';

type AuthRequest = Request & {
  user?: {
    id: number;
    role: string;
  };
};

const SUPPORT_PREFIX = 'SUPPORT_';
const STATUS_OPEN = 'SUPPORT_OPEN';
const STATUS_PENDING = 'SUPPORT_PENDING';
const STATUS_CLOSED = 'SUPPORT_CLOSED';
const ALLOWED_STATUSES = new Set([STATUS_OPEN, STATUS_PENDING, STATUS_CLOSED]);

const toPositiveInt = (value: unknown) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const toSessionQuery = (req: AuthRequest) => {
  const isAdmin = req.user?.role === 'ADMIN';
  const userId = req.user?.id;

  if (!userId) return null;

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
                { title: { contains: search, mode: 'insensitive' as const } },
                { user: { name: { contains: search, mode: 'insensitive' as const } } },
                { user: { email: { contains: search, mode: 'insensitive' as const } } },
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

export const getSupportSessions = async (req: AuthRequest, res: Response) => {
  try {
    const query = toSessionQuery(req);
    if (!query) return res.status(401).json({ error: 'Unauthorized' });

    const sessions = await prisma.chatSession.findMany({
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
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Cannot get support sessions' });
  }
};

export const createSupportSession = async (req: AuthRequest, res: Response) => {
  try {
    const authUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

    const requestedUserId = toPositiveInt(req.body?.userId);
    const ownerUserId = isAdmin ? requestedUserId || authUserId : authUserId;

    if (!ownerUserId) return res.status(400).json({ error: 'userId is required' });

    const titleRaw = String(req.body?.title || '').trim();
    const title = titleRaw || 'Ho tro khach hang';

    if (!isAdmin) {
      const existing = await prisma.chatSession.findFirst({
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

    const session = await prisma.chatSession.create({
      data: {
        userId: ownerUserId,
        title,
        status: STATUS_OPEN,
      },
    });

    return res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Cannot create support session' });
  }
};

export const getSupportSession = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = toPositiveInt(req.params.id);
    const authUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

    const session = await prisma.chatSession.findFirst({
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

    if (!session) return res.status(404).json({ error: 'Support session not found' });
    return res.json({ success: true, data: session });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Cannot get support session' });
  }
};

export const sendSupportMessage = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = toPositiveInt(req.params.id);
    const authUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const content = String(req.body?.content || '').trim();

    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        status: { startsWith: SUPPORT_PREFIX },
        ...(isAdmin ? {} : { userId: authUserId }),
      },
      select: { id: true, userId: true, status: true },
    });

    if (!session) return res.status(404).json({ error: 'Support session not found' });

    const role = isAdmin ? 'ADMIN' : 'USER';
    const nextStatus = isAdmin ? STATUS_OPEN : STATUS_PENDING;

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role,
        content,
      },
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        updatedAt: new Date(),
        status: session.status === STATUS_CLOSED ? STATUS_OPEN : nextStatus,
      },
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Cannot send support message' });
  }
};

export const updateSupportSessionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = toPositiveInt(req.params.id);
    const isAdmin = req.user?.role === 'ADMIN';
    const nextStatus = String(req.body?.status || '').trim().toUpperCase();

    if (!isAdmin) return res.status(403).json({ error: 'Only admin can update support status' });
    if (!sessionId) return res.status(400).json({ error: 'Invalid session id' });
    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return res.status(400).json({ error: 'Invalid support status' });
    }

    const updated = await prisma.chatSession.updateMany({
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

    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    return res.json({ success: true, data: session });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Cannot update support status' });
  }
};
