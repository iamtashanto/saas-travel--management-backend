import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { prisma } from '../../config/database';

export const requireActiveOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.organizationId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Organization context is missing');
    }

    const org = await prisma.organization.findUnique({
      where: { id: req.auth.organizationId },
      select: { status: true, deletedAt: true }
    });

    if (!org || org.deletedAt) {
      throw new AppError(404, 'NOT_FOUND', 'Organization not found');
    }

    if (org.status === 'SUSPENDED' || org.status === 'CANCELLED') {
      throw new AppError(403, 'FORBIDDEN', 'Organization is suspended or cancelled');
    }

    next();
  } catch (error) {
    next(error);
  }
};
