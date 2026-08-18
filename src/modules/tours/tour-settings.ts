import { Request, Response, Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { prisma } from '../../config/database';
import { TourService } from './tour.service';
import * as validation from './tour-settings.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requirePermission } from '../../common/middleware/permission.middleware';

export class TourSettingsService {
  static async getSEO(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    return prisma.tourSEO.findUnique({ where: { tourPackageId: tourId } });
  }

  static async putSEO(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const seo = await prisma.tourSEO.upsert({
      where: { tourPackageId: tourId },
      update: data,
      create: { ...data, tourPackageId: tourId }
    });
    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'SEO_UPDATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
    return seo;
  }

  static async getBookingRules(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    return prisma.tourBookingRule.findUnique({ where: { tourPackageId: tourId } });
  }

  static async putBookingRules(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const rules = await prisma.tourBookingRule.upsert({
      where: { tourPackageId: tourId },
      update: data,
      create: { ...data, tourPackageId: tourId }
    });
    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'BOOKING_RULES_UPDATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
    return rules;
  }

  static async getCancellationPolicy(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    const policy = await prisma.tourCancellationPolicy.findUnique({ where: { tourPackageId: tourId } });
    if (!policy) return null;
    return { ...policy, partialRefundPercentage: policy.partialRefundPercentage ? policy.partialRefundPercentage.toNumber() : null };
  }

  static async putCancellationPolicy(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const policy = await prisma.tourCancellationPolicy.upsert({
      where: { tourPackageId: tourId },
      update: data,
      create: { ...data, tourPackageId: tourId }
    });
    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'CANCELLATION_POLICY_UPDATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
    return { ...policy, partialRefundPercentage: policy.partialRefundPercentage ? policy.partialRefundPercentage.toNumber() : null };
  }
}

export const getSEO = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.getSEO(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: data || {}, message: 'SEO retrieved' });
});

export const putSEO = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.putSEO(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data, message: 'SEO updated' });
});

export const getBookingRules = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.getBookingRules(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: data || {}, message: 'Booking rules retrieved' });
});

export const putBookingRules = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.putBookingRules(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data, message: 'Booking rules updated' });
});

export const getCancellationPolicy = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.getCancellationPolicy(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: data || {}, message: 'Cancellation policy retrieved' });
});

export const putCancellationPolicy = asyncHandler(async (req: Request, res: Response) => {
  const data = await TourSettingsService.putCancellationPolicy(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data, message: 'Cancellation policy updated' });
});

export const tourSEORoutes = Router({ mergeParams: true });
tourSEORoutes.get('/', requirePermission('tour.seo.read'), getSEO);
tourSEORoutes.put('/', requirePermission('tour.seo.update'), validateRequest(validation.putSEOSchema), putSEO);

export const tourBookingRulesRoutes = Router({ mergeParams: true });
tourBookingRulesRoutes.get('/', requirePermission('tour.bookingRules.read'), getBookingRules);
tourBookingRulesRoutes.put('/', requirePermission('tour.bookingRules.update'), validateRequest(validation.putBookingRulesSchema), putBookingRules);

export const tourCancellationPolicyRoutes = Router({ mergeParams: true });
tourCancellationPolicyRoutes.get('/', requirePermission('tour.cancellationPolicy.read'), getCancellationPolicy);
tourCancellationPolicyRoutes.put('/', requirePermission('tour.cancellationPolicy.update'), validateRequest(validation.putCancellationPolicySchema), putCancellationPolicy);
