import { PickupPointRepository } from './pickup-point.repository';
import { CreatePickupPointInput, UpdatePickupPointInput, ListPickupPointsQuery } from './pickup-point.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';

export class PickupPointService {
  static async listPickupPoints(organizationId: string, query: ListPickupPointsQuery) {
    return PickupPointRepository.listPickupPoints(organizationId, query);
  }

  static async getPickupPoint(id: string, organizationId: string) {
    const point = await PickupPointRepository.getPickupPointById(id, organizationId);
    if (!point) throw new AppError(404, 'PICKUP_POINT_NOT_FOUND', 'Pickup point not found');
    return point;
  }

  static async createPickupPoint(organizationId: string, data: CreatePickupPointInput, actorUserId: string) {
    const point = await PickupPointRepository.createPickupPoint({
      ...data,
      organization: { connect: { id: organizationId } }
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'PICKUP_POINT_CREATED',
        module: 'pickupPoints',
        entityType: 'PickupPoint',
        entityId: point.id,
      }
    });

    return point;
  }

  static async updatePickupPoint(id: string, organizationId: string, data: UpdatePickupPointInput, actorUserId: string) {
    const point = await this.getPickupPoint(id, organizationId);

    const updated = await PickupPointRepository.updatePickupPoint(id, data as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'PICKUP_POINT_UPDATED',
        module: 'pickupPoints',
        entityType: 'PickupPoint',
        entityId: id,
        oldValues: { name: point.name, address: point.address, status: point.status } as any,
      }
    });

    return updated;
  }

  static async deletePickupPoint(id: string, organizationId: string, actorUserId: string) {
    await this.getPickupPoint(id, organizationId);

    const usageCount = await PickupPointRepository.countSchedulesUsingPickupPoint(id);
    
    if (usageCount > 0) {
      await PickupPointRepository.archivePickupPoint(id);
      
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'PICKUP_POINT_ARCHIVED',
          module: 'pickupPoints',
          entityType: 'PickupPoint',
          entityId: id,
          metadata: { reason: 'PICKUP_POINT_IN_USE' } as any,
        }
      });
      return { archived: true };
    }

    await PickupPointRepository.deletePickupPoint(id);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'PICKUP_POINT_DELETED',
        module: 'pickupPoints',
        entityType: 'PickupPoint',
        entityId: id,
      }
    });
    
    return { archived: false };
  }
}
