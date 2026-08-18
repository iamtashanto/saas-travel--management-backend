import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { DestinationService } from './destination.service';
import { AppError } from '../../common/errors/AppError';

export const listDestinations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await DestinationService.listDestinations(req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Destinations retrieved' });
});

export const getDestination = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const dest = await DestinationService.getDestination(req.params.id, req.auth.organizationId);
  res.status(200).json({ success: true, data: dest, message: 'Destination retrieved' });
});

export const createDestination = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const dest = await DestinationService.createDestination(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: dest, message: 'Destination created' });
});

export const updateDestination = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const dest = await DestinationService.updateDestination(req.params.id, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: dest, message: 'Destination updated' });
});

export const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await DestinationService.deleteDestination(req.params.id, req.auth.organizationId, req.auth.userId);
  
  if (result.archived) {
    res.status(200).json({ success: true, data: {}, message: 'Destination is in use and has been archived instead of deleted' });
  } else {
    res.status(200).json({ success: true, data: {}, message: 'Destination deleted' });
  }
});
