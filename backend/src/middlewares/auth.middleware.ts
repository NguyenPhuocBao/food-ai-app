import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { markUserActive } from '../services/active-user.service';
import { resolveJwtSecret } from '../utils/jwt.util';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const jwtSecret = resolveJwtSecret();

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email: string;
      role: string;
      iat?: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true, passwordChangedAt: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Forbidden: Account is inactive' });
    }
    if (
      user.passwordChangedAt &&
      decoded.iat &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(401).json({ error: 'Unauthorized: Token has expired' });
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
  } catch (error: any) {
    if (error?.message?.startsWith('Server auth misconfigured:')) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
