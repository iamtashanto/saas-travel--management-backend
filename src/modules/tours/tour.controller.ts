import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { TourService } from './tour.service';
import { AppError } from '../../common/errors/AppError';

export const listTours = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await TourService.listTours(req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Tours retrieved' });
});

export const getTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.getTour(req.params.id, req.auth.organizationId);
  res.status(200).json({ success: true, data: tour, message: 'Tour retrieved' });
});

export const createTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.createTour(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: tour, message: 'Tour created' });
});

export const updateTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.updateTour(req.params.id, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: tour, message: 'Tour updated' });
});

export const publishTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.publishTour(req.params.id, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: tour, message: 'Tour published' });
});

export const unpublishTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.unpublishTour(req.params.id, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: tour, message: 'Tour unpublished' });
});

export const archiveTour = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.archiveTour(req.params.id, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: tour, message: 'Tour archived' });
});

export const deleteTour = asyncHandler(async (req: Request, res: Response) => {
  // We don't hard delete tours, we just reuse the archive function
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const tour = await TourService.archiveTour(req.params.id, req.auth.organizationId, req.auth.userId);
  res.status(200).json({ success: true, data: tour, message: 'Tour archived instead of deleted' });
});
