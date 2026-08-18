import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { PermissionService } from '../../modules/auth/permission.service';

export const requirePermission = (permissionKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId || !req.auth?.organizationId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication context is missing');
      }

      const hasPerm = await PermissionService.hasPermission(
        req.auth.userId,
        req.auth.organizationId,
        permissionKey
      );

      if (!hasPerm) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
