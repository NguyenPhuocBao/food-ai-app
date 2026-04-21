import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { markUserActive } from '../services/active-user.service';

const FALLBACK_DEV_SECRET = 'food-ai-secret-key-2024';
const prisma = new PrismaClient();
let warnedInsecureSecret = false;

const resolveJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (secret) return { secret, insecure: secret === FALLBACK_DEV_SECRET };

  if (process.env.NODE_ENV === 'production') {
    return { secret: '', insecure: true };
  }

  return { secret: FALLBACK_DEV_SECRET, insecure: true };
};

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { secret: jwtSecret, insecure } = resolveJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server auth misconfigured: JWT_SECRET is required' });
    }
    if (insecure && !warnedInsecureSecret) {
      warnedInsecureSecret = true;
      console.warn(
        '[auth] JWT_SECRET is missing or using insecure default. Set a strong JWT_SECRET before deployment.',
      );
    }

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
