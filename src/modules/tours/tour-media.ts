import { Request, Response, Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { TourService } from './tour.service';
import * as validation from './tour-media.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requirePermission } from '../../common/middleware/permission.middleware';

export class TourMediaService {
  static async getMedia(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    return prisma.tourMedia.findMany({
      where: { tourPackageId: tourId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  static async createMedia(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.tourMedia.updateMany({
          where: { tourPackageId: tourId, isPrimary: true },
          data: { isPrimary: false }
        });
      }

      const item = await tx.tourMedia.create({
        data: { ...data, tourPackageId: tourId }
      });
      
      await tx.auditLog.create({
        data: {
          organizationId, userId: actorUserId, action: 'MEDIA_CREATED',
          module: 'tours', entityType: 'TourPackage', entityId: tourId,
        }
      });

      return item;
    });
  }

  static async updateMedia(mediaId: string, tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourMedia.findFirst({ where: { id: mediaId, tourPackageId: tourId }});
    if (!existing) throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media not found');

    return prisma.$transaction(async (tx) => {
      if (data.isPrimary && !existing.isPrimary) {
        await tx.tourMedia.updateMany({
          where: { tourPackageId: tourId, isPrimary: true },
          data: { isPrimary: false }
        });
      }

      const item = await tx.tourMedia.update({
        where: { id: mediaId },
        data
      });

      await tx.auditLog.create({
        data: {
          organizationId, userId: actorUserId, action: 'MEDIA_UPDATED',
          module: 'tours', entityType: 'TourPackage', entityId: tourId,
        }
      });

      return item;
    });
  }

  static async deleteMedia(mediaId: string, tourId: string, organizationId: string, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourMedia.findFirst({ where: { id: mediaId, tourPackageId: tourId }});
    if (!existing) throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media not found');

    await prisma.tourMedia.delete({ where: { id: mediaId } });

    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'MEDIA_DELETED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
  }

  static async reorderMedia(tourId: string, organizationId: string, items: any[], actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.tourMedia.findFirst({ where: { id: item.id, tourPackageId: tourId }});
        if (!existing) throw new AppError(404, 'MEDIA_NOT_FOUND', `Item ${item.id} not found in this tour`);

        await tx.tourMedia.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        });
      }

      await tx.auditLog.create({
        data: {
          organizationId, userId: actorUserId, action: 'MEDIA_REORDERED',
          module: 'tours', entityType: 'TourPackage', entityId: tourId,
        }
      });
    });
  }
}

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const items = await TourMediaService.getMedia(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: items, message: 'Media retrieved' });
});

export const createMedia = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourMediaService.createMedia(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(201).json({ success: true, data: item, message: 'Media created' });
});

export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourMediaService.updateMedia(req.params.mediaId, req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data: item, message: 'Media updated' });
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await TourMediaService.deleteMedia(req.params.mediaId, req.params.tourId, req.auth!.organizationId, req.auth!.userId);
  res.status(200).json({ success: true, data: {}, message: 'Media deleted' });
});

export const reorderMedia = asyncHandler(async (req: Request, res: Response) => {
  await TourMediaService.reorderMedia(req.params.tourId, req.auth!.organizationId, req.body.items, req.auth!.userId);
  res.status(200).json({ success: true, data: {}, message: 'Media reordered' });
});

export const tourMediaRoutes = Router({ mergeParams: true });

tourMediaRoutes.get('/', requirePermission('tour.media.read'), getMedia);
tourMediaRoutes.post('/', requirePermission('tour.media.create'), validateRequest(validation.createMediaSchema), createMedia);
tourMediaRoutes.put('/reorder', requirePermission('tour.media.reorder'), validateRequest(validation.reorderMediaSchema), reorderMedia);
tourMediaRoutes.patch('/:mediaId', requirePermission('tour.media.update'), validateRequest(validation.updateMediaSchema), updateMedia);
tourMediaRoutes.delete('/:mediaId', requirePermission('tour.media.delete'), deleteMedia);
