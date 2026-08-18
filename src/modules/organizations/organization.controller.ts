import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { OrganizationService } from './organization.service';
import { AppError } from '../../common/errors/AppError';

export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.organizationId) throw new AppError(401, 'UNAUTHORIZED', 'Missing organization context');
  
  const org = await OrganizationService.getOrganization(req.auth.organizationId);
  res.status(200).json({ success: true, data: org, message: 'Organization retrieved successfully' });
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing authentication context');

  const org = await OrganizationService.updateOrganization(
    req.auth.organizationId,
    req.body,
    req.auth.userId
  );
  
  res.status(200).json({ success: true, data: org, message: 'Organization updated successfully' });
});

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.organizationId) throw new AppError(401, 'UNAUTHORIZED', 'Missing organization context');

  const settings = await OrganizationService.getSettings(req.auth.organizationId);
  res.status(200).json({ success: true, data: settings, message: 'Organization settings retrieved successfully' });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing authentication context');

  const settings = await OrganizationService.updateSettings(
    req.auth.organizationId,
    req.body,
    req.auth.userId
  );

  res.status(200).json({ success: true, data: settings, message: 'Organization settings updated successfully' });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.organizationId) throw new AppError(401, 'UNAUTHORIZED', 'Missing organization context');

  const stats = await OrganizationService.getStats(req.auth.organizationId);
  res.status(200).json({ success: true, data: stats, message: 'Organization stats retrieved successfully' });
});

export const getSecurity = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.organizationId) throw new AppError(401, 'UNAUTHORIZED', 'Missing organization context');

  const security = await OrganizationService.getSecurityStats(req.auth.organizationId);
  res.status(200).json({ success: true, data: security, message: 'Organization security stats retrieved successfully' });
});
