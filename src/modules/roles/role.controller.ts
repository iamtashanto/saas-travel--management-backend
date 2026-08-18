import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { RoleService } from './role.service';
import { AppError } from '../../common/errors/AppError';

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  
  const roles = await RoleService.getRoles(req.auth.organizationId);
  res.status(200).json({ success: true, data: roles, message: 'Roles retrieved' });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');

  const role = await RoleService.getRole(req.params.roleId, req.auth.organizationId);
  res.status(200).json({ success: true, data: role, message: 'Role retrieved' });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');

  const role = await RoleService.createRole(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: role, message: 'Role created successfully' });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');

  const role = await RoleService.updateRole(req.params.roleId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: role, message: 'Role updated successfully' });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');

  await RoleService.deleteRole(req.params.roleId, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Role deleted successfully' });
});

export const updatePermissions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');

  const role = await RoleService.updatePermissions(req.params.roleId, req.auth.organizationId, req.body.permissionKeys, req.auth.userId);
  res.status(200).json({ success: true, data: role, message: 'Role permissions updated successfully' });
});
