import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListDestinationsQuery } from './destination.types';

export class DestinationRepository {
  static async listDestinations(organizationId: string, query: ListDestinationsQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DestinationWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;
    if (query.country) where.country = query.country;
    if (query.division) where.division = query.division;
    if (query.district) where.district = query.district;

    if (query.search) {
      const searchStr = query.search.toLowerCase();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { shortDescription: { contains: searchStr, mode: 'insensitive' } },
        { locationName: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.destination.count({ where }),
      prisma.destination.findMany({
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

  static async getDestinationById(id: string, organizationId: string) {
    const dest = await prisma.destination.findFirst({
      where: { id, organizationId }
    });
    if (!dest) return null;
    return {
      ...dest,
      latitude: dest.latitude ? dest.latitude.toNumber() : null,
      longitude: dest.longitude ? dest.longitude.toNumber() : null,
    };
  }

  static async getDestinationBySlug(slug: string, organizationId: string) {
    return prisma.destination.findUnique({
      where: { organizationId_slug: { organizationId, slug } }
    });
  }

  static async createDestination(data: Prisma.DestinationCreateInput) {
    const dest = await prisma.destination.create({ data });
    return {
      ...dest,
      latitude: dest.latitude ? dest.latitude.toNumber() : null,
      longitude: dest.longitude ? dest.longitude.toNumber() : null,
    };
  }

  static async updateDestination(id: string, data: Prisma.DestinationUpdateInput) {
    const dest = await prisma.destination.update({
      where: { id },
      data
    });
    return {
      ...dest,
      latitude: dest.latitude ? dest.latitude.toNumber() : null,
      longitude: dest.longitude ? dest.longitude.toNumber() : null,
    };
  }

  static async countToursByDestination(id: string) {
    return prisma.tourPackage.count({
      where: { destinationId: id }
    });
  }

  static async archiveDestination(id: string) {
    return prisma.destination.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
  }

  static async deleteDestination(id: string) {
    return prisma.destination.delete({
      where: { id }
    });
  }
}
