import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { PermissionService } from './permission.service';

export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
  const moduleFilter = req.query.module as string | undefined;
  
  const permissions = await PermissionService.getPermissions(moduleFilter);
  
  res.status(200).json({ 
    success: true, 
    data: permissions, 
    message: 'Permissions retrieved successfully' 
  });
});
