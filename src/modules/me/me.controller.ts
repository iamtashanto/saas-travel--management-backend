import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { StaffService } from '../staff/staff.service';
import { PermissionService } from '../permissions/permission.service';
import { AppError } from '../../common/errors/AppError';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  
  const user = await StaffService.getStaff(req.auth.userId, req.auth.organizationId);
  const permissions = await PermissionService.getUserPermissions(req.auth.userId, req.auth.organizationId);

  res.status(200).json({ 
    success: true, 
    data: {
      ...user,
      permissions: Array.from(permissions)
    }, 
    message: 'Profile retrieved' 
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  
  const user = await StaffService.updateStaff(req.auth.userId, req.auth.organizationId, req.body, req.auth.userId);
  
  res.status(200).json({ 
    success: true, 
    data: user, 
    message: 'Profile updated' 
  });
});
