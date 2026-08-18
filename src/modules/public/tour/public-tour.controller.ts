import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { PublicTourService } from './public-tour.service';

export const listPublicTours = asyncHandler(async (req: Request, res: Response) => {
  const publicTenant = (req as any).publicTenant;
  const result = await PublicTourService.listPublicTours(publicTenant.organizationId, req.query);
  res.status(200).json({ success: true, data: result, message: 'Public tours retrieved' });
});

export const getPublicTour = asyncHandler(async (req: Request, res: Response) => {
  const publicTenant = (req as any).publicTenant;
  const tour = await PublicTourService.getPublicTour(req.params.slug, publicTenant.organizationId);
  res.status(200).json({ success: true, data: tour, message: 'Public tour retrieved' });
});
