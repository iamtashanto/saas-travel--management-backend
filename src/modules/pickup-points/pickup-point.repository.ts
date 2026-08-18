import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListPickupPointsQuery } from './pickup-point.types';

export class PickupPointRepository {
  static async listPickupPoints(organizationId: string, query: ListPickupPointsQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PickupPointWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;

    if (query.search) {
      const searchStr = query.search.toLowerCase();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { address: { contains: searchStr, mode: 'insensitive' } },
        { contactName: { contains: searchStr, mode: 'insensitive' } },
        { contactPhone: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.pickupPoint.count({ where }),
      prisma.pickupPoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sort || 'createdAt']: query.order || 'desc' },
      })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        latitude: item.latitude ? item.latitude.toNumber() : null,
        longitude: item.longitude ? item.longitude.toNumber() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getPickupPointById(id: string, organizationId: string) {
    const point = await prisma.pickupPoint.findFirst({
      where: { id, organizationId }
    });
    if (!point) return null;
    return {
      ...point,
      latitude: point.latitude ? point.latitude.toNumber() : null,
      longitude: point.longitude ? point.longitude.toNumber() : null,
    };
  }

  static async createPickupPoint(data: Prisma.PickupPointCreateInput) {
    const point = await prisma.pickupPoint.create({ data });
    return {
      ...point,
      latitude: point.latitude ? point.latitude.toNumber() : null,
      longitude: point.longitude ? point.longitude.toNumber() : null,
    };
  }

  static async updatePickupPoint(id: string, data: Prisma.PickupPointUpdateInput) {
    const point = await prisma.pickupPoint.update({
      where: { id },
      data
    });
    return {
      ...point,
      latitude: point.latitude ? point.latitude.toNumber() : null,
      longitude: point.longitude ? point.longitude.toNumber() : null,
    };
  }

  static async countSchedulesUsingPickupPoint(id: string) {
    // In the future this might check TourSchedulePickupPoint join tables or string matches.
    // Right now departureLocation/returnLocation are strings. We will check if it matches name.
    const point = await prisma.pickupPoint.findUnique({ where: { id }});
    if (!point) return 0;
    
    return prisma.tourSchedule.count({
      where: {
        OR: [
          { departureLocation: point.name },
          { returnLocation: point.name }
        ]
      }
    });
  }

  static async archivePickupPoint(id: string) {
    return prisma.pickupPoint.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
  }

  static async deletePickupPoint(id: string) {
    return prisma.pickupPoint.delete({
      where: { id }
    });
  }
}
