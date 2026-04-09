import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { markUserActive } from '../services/active-user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'food-ai-secret-key-2024';
const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Forbidden: Account is inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    void markUserActive(user.id).catch(() => {
      // Ignore tracking failures to avoid blocking authenticated requests.
    });
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
