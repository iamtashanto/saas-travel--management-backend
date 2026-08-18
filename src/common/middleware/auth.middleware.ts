import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../errors/AppError';
import { prisma } from '../../config/database';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    
    // 1. Verify token signature and expiration
    const decoded = verifyAccessToken(token);

    // 2. Load User to ensure they are still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { status: true, deletedAt: true }
    });

    if (!user || user.deletedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'Account no longer exists');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new AppError(403, 'FORBIDDEN', 'Account is suspended or deactivated');
    }

    // 3. Verify the session still exists and hasn't been revoked
    const session = await prisma.authSession.findUnique({
      where: { id: decoded.sessionId }
    });

    if (!session || session.revokedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'Session has been revoked or is invalid');
    }

    // 4. Attach context
    req.auth = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired authentication token'));
    }
  }
};
