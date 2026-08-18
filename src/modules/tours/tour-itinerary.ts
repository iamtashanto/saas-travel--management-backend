import { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { TourService } from './tour.service';
import * as validation from './tour-itinerary.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requirePermission } from '../../common/middleware/permission.middleware';

export class TourItineraryService {
  static async getItinerary(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    const items = await prisma.tourItineraryItem.findMany({
      where: { tourPackageId: tourId },
      orderBy: [{ dayNumber: 'asc' }, { sortOrder: 'asc' }]
    });
    return items.map(item => ({
      ...item,
      latitude: item.latitude ? item.latitude.toNumber() : null,
      longitude: item.longitude ? item.longitude.toNumber() : null
    }));
  }

  static async createItineraryItem(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const item = await prisma.tourItineraryItem.create({
      data: { ...data, tourPackageId: tourId }
    });
    
    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ITINERARY_CREATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });

    return {
      ...item,
      latitude: item.latitude ? item.latitude.toNumber() : null,
      longitude: item.longitude ? item.longitude.toNumber() : null
    };
  }

  static async updateItineraryItem(itemId: string, tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourItineraryItem.findFirst({ where: { id: itemId, tourPackageId: tourId }});
    if (!existing) throw new AppError(404, 'ITINERARY_ITEM_NOT_FOUND', 'Item not found');

    const item = await prisma.tourItineraryItem.update({
      where: { id: itemId },
      data
    });

    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ITINERARY_UPDATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });

    return {
      ...item,
      latitude: item.latitude ? item.latitude.toNumber() : null,
      longitude: item.longitude ? item.longitude.toNumber() : null
    };
  }

  static async deleteItineraryItem(itemId: string, tourId: string, organizationId: string, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourItineraryItem.findFirst({ where: { id: itemId, tourPackageId: tourId }});
    if (!existing) throw new AppError(404, 'ITINERARY_ITEM_NOT_FOUND', 'Item not found');

    await prisma.tourItineraryItem.delete({ where: { id: itemId } });

    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ITINERARY_DELETED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
  }

  static async reorderItinerary(tourId: string, organizationId: string, items: any[], actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.tourItineraryItem.findFirst({ where: { id: item.id, tourPackageId: tourId }});
        if (!existing) throw new AppError(404, 'ITINERARY_ITEM_NOT_FOUND', `Item ${item.id} not found in this tour`);

        await tx.tourItineraryItem.update({
          where: { id: item.id },
          data: { dayNumber: item.dayNumber, sortOrder: item.sortOrder }
        });
      }

      await tx.auditLog.create({
        data: {
          organizationId, userId: actorUserId, action: 'ITINERARY_REORDERED',
          module: 'tours', entityType: 'TourPackage', entityId: tourId,
        }
      });
    });
  }
}

export const getItinerary = asyncHandler(async (req: Request, res: Response) => {
  const items = await TourItineraryService.getItinerary(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: items, message: 'Itinerary retrieved' });
});

export const createItineraryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourItineraryService.createItineraryItem(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(201).json({ success: true, data: item, message: 'Item created' });
});

export const updateItineraryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourItineraryService.updateItineraryItem(req.params.itemId, req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data: item, message: 'Item updated' });
});

export const deleteItineraryItem = asyncHandler(async (req: Request, res: Response) => {
  await TourItineraryService.deleteItineraryItem(req.params.itemId, req.params.tourId, req.auth!.organizationId, req.auth!.userId);
  res.status(200).json({ success: true, data: {}, message: 'Item deleted' });
});

export const reorderItinerary = asyncHandler(async (req: Request, res: Response) => {
  await TourItineraryService.reorderItinerary(req.params.tourId, req.auth!.organizationId, req.body.items, req.auth!.userId);
  res.status(200).json({ success: true, data: {}, message: 'Itinerary reordered' });
});

export const tourItineraryRoutes = Router({ mergeParams: true });

tourItineraryRoutes.get('/', requirePermission('tour.itinerary.read'), getItinerary);
tourItineraryRoutes.post('/', requirePermission('tour.itinerary.create'), validateRequest(validation.createItineraryItemSchema), createItineraryItem);
tourItineraryRoutes.put('/reorder', requirePermission('tour.itinerary.reorder'), validateRequest(validation.reorderItinerarySchema), reorderItinerary);
tourItineraryRoutes.patch('/:itemId', requirePermission('tour.itinerary.update'), validateRequest(validation.updateItineraryItemSchema), updateItineraryItem);
tourItineraryRoutes.delete('/:itemId', requirePermission('tour.itinerary.delete'), deleteItineraryItem);
