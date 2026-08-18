import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { PickupPointService } from './pickup-point.service';
import { AppError } from '../../common/errors/AppError';

export const listPickupPoints = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await PickupPointService.listPickupPoints(req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Pickup points retrieved' });
});

export const getPickupPoint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const point = await PickupPointService.getPickupPoint(req.params.id, req.auth.organizationId);
  res.status(200).json({ success: true, data: point, message: 'Pickup point retrieved' });
});

export const createPickupPoint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const point = await PickupPointService.createPickupPoint(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: point, message: 'Pickup point created' });
});

export const updatePickupPoint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const point = await PickupPointService.updatePickupPoint(req.params.id, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: point, message: 'Pickup point updated' });
});

export const deletePickupPoint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await PickupPointService.deletePickupPoint(req.params.id, req.auth.organizationId, req.auth.userId);
  
  if (result.archived) {
    res.status(200).json({ success: true, data: {}, message: 'Pickup point is in use and has been archived instead of deleted' });
  } else {
    res.status(200).json({ success: true, data: {}, message: 'Pickup point deleted' });
  }
});
