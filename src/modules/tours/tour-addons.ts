import { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { TourService } from './tour.service';
import * as validation from './tour-addons.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requirePermission } from '../../common/middleware/permission.middleware';

export class TourAddonsService {
  static async getAddons(tourId: string, organizationId: string) {
    await TourService.getTour(tourId, organizationId);
    const items = await prisma.tourAddon.findMany({
      where: { tourPackageId: tourId, organizationId },
      orderBy: { sortOrder: 'asc' }
    });
    return items.map(item => ({ ...item, price: item.price.toNumber() }));
  }

  static async createAddon(tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const item = await prisma.tourAddon.create({
      data: { ...data, tourPackageId: tourId, organizationId }
    });
    
    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ADDON_CREATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });

    return { ...item, price: item.price.toNumber() };
  }

  static async updateAddon(addonId: string, tourId: string, organizationId: string, data: any, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourAddon.findFirst({ where: { id: addonId, tourPackageId: tourId, organizationId }});
    if (!existing) throw new AppError(404, 'ADDON_NOT_FOUND', 'Addon not found');

    const item = await prisma.tourAddon.update({
      where: { id: addonId },
      data
    });

    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ADDON_UPDATED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });

    return { ...item, price: item.price.toNumber() };
  }

  static async deleteAddon(addonId: string, tourId: string, organizationId: string, actorUserId: string) {
    await TourService.getTour(tourId, organizationId);
    const existing = await prisma.tourAddon.findFirst({ where: { id: addonId, tourPackageId: tourId, organizationId }});
    if (!existing) throw new AppError(404, 'ADDON_NOT_FOUND', 'Addon not found');

    await prisma.tourAddon.delete({ where: { id: addonId } });

    await prisma.auditLog.create({
      data: {
        organizationId, userId: actorUserId, action: 'ADDON_DELETED',
        module: 'tours', entityType: 'TourPackage', entityId: tourId,
      }
    });
  }
}

export const getAddons = asyncHandler(async (req: Request, res: Response) => {
  const items = await TourAddonsService.getAddons(req.params.tourId, req.auth!.organizationId);
  res.status(200).json({ success: true, data: items, message: 'Addons retrieved' });
});

export const createAddon = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourAddonsService.createAddon(req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(201).json({ success: true, data: item, message: 'Addon created' });
});

export const updateAddon = asyncHandler(async (req: Request, res: Response) => {
  const item = await TourAddonsService.updateAddon(req.params.addonId, req.params.tourId, req.auth!.organizationId, req.body, req.auth!.userId);
  res.status(200).json({ success: true, data: item, message: 'Addon updated' });
});

export const deleteAddon = asyncHandler(async (req: Request, res: Response) => {
  await TourAddonsService.deleteAddon(req.params.addonId, req.params.tourId, req.auth!.organizationId, req.auth!.userId);
  res.status(200).json({ success: true, data: {}, message: 'Addon deleted' });
});

export const tourAddonsRoutes = Router({ mergeParams: true });

tourAddonsRoutes.get('/', requirePermission('tour.addon.read'), getAddons);
tourAddonsRoutes.post('/', requirePermission('tour.addon.create'), validateRequest(validation.createAddonSchema), createAddon);
tourAddonsRoutes.patch('/:addonId', requirePermission('tour.addon.update'), validateRequest(validation.updateAddonSchema), updateAddon);
tourAddonsRoutes.delete('/:addonId', requirePermission('tour.addon.delete'), deleteAddon);
