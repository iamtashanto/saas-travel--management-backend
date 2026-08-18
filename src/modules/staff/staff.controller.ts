import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { StaffService } from './staff.service';
import { AppError } from '../../common/errors/AppError';

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await StaffService.listStaff(req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Staff retrieved' });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const user = await StaffService.getStaff(req.params.userId, req.auth.organizationId);
  res.status(200).json({ success: true, data: user, message: 'Staff retrieved' });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const user = await StaffService.updateStaff(req.params.userId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: user, message: 'Staff updated' });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const user = await StaffService.updateStatus(req.params.userId, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: user, message: 'Staff status updated' });
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  await StaffService.deleteStaff(req.params.userId, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Staff deleted successfully' });
});

export const updateRoles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  await StaffService.updateRoles(req.params.userId, req.auth.organizationId, req.body.roleIds, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Staff roles updated successfully' });
});

export const revokeSessions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  await StaffService.revokeSessions(req.params.userId, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Sessions revoked successfully' });
});

export const inviteStaff = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const inv = await StaffService.inviteStaff(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: inv, message: 'Invitation sent' });
});

export const listInvitations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const invs = await StaffService.listInvitations(req.auth.organizationId);
  res.status(200).json({ success: true, data: invs, message: 'Invitations retrieved' });
});

export const cancelInvitation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  await StaffService.cancelInvitation(req.params.invitationId, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: {}, message: 'Invitation cancelled' });
});
