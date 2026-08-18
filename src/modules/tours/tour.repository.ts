import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListToursQuery } from './tour.types';

export class TourRepository {
  static async listTours(organizationId: string, query: ListToursQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TourPackageWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;
    if (query.destinationId) where.destinationId = query.destinationId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.duration) where.durationDays = query.duration;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) where.basePrice.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.basePrice.lte = query.maxPrice;
    }

    if (query.search) {
      const searchStr = query.search.toLowerCase();
      where.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { shortDescription: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.tourPackage.count({ where }),
      prisma.tourPackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sort || 'createdAt']: query.order || 'desc' },
        include: {
          destination: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } }
        }
      })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        basePrice: item.basePrice.toNumber(),
        childPrice: item.childPrice ? item.childPrice.toNumber() : null,
        infantPrice: item.infantPrice ? item.infantPrice.toNumber() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getTourById(id: string, organizationId: string) {
    const tour = await prisma.tourPackage.findFirst({
      where: { id, organizationId },
      include: {
        destination: true,
        category: true,
        seo: true,
        bookingRules: true,
        cancellationPolicy: true,
        itinerary: { orderBy: [{ dayNumber: 'asc' }, { sortOrder: 'asc' }] },
        inclusions: { orderBy: { sortOrder: 'asc' } },
        exclusions: { orderBy: { sortOrder: 'asc' } },
        addons: { orderBy: { sortOrder: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        schedules: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' },
          take: 5
        }
      }
    });

    if (!tour) return null;

    return {
      ...tour,
      basePrice: tour.basePrice.toNumber(),
      childPrice: tour.childPrice ? tour.childPrice.toNumber() : null,
      infantPrice: tour.infantPrice ? tour.infantPrice.toNumber() : null,
      addons: tour.addons.map(a => ({ ...a, price: a.price.toNumber() })),
      schedules: tour.schedules.map(s => ({
        ...s,
        basePriceOverride: s.basePriceOverride ? s.basePriceOverride.toNumber() : null,
        adultPrice: s.adultPrice ? s.adultPrice.toNumber() : null,
        childPrice: s.childPrice ? s.childPrice.toNumber() : null,
        infantPrice: s.infantPrice ? s.infantPrice.toNumber() : null,
      })),
      cancellationPolicy: tour.cancellationPolicy ? {
        ...tour.cancellationPolicy,
        partialRefundPercentage: tour.cancellationPolicy.partialRefundPercentage ? tour.cancellationPolicy.partialRefundPercentage.toNumber() : null
      } : null
    };
  }

  static async getTourBySlug(slug: string, organizationId: string) {
    return prisma.tourPackage.findUnique({
      where: { organizationId_slug: { organizationId, slug } }
    });
  }

  static async createTour(data: Prisma.TourPackageCreateInput) {
    const tour = await prisma.tourPackage.create({ data });
    return {
      ...tour,
      basePrice: tour.basePrice.toNumber(),
      childPrice: tour.childPrice ? tour.childPrice.toNumber() : null,
      infantPrice: tour.infantPrice ? tour.infantPrice.toNumber() : null,
    };
  }

  static async updateTour(id: string, data: Prisma.TourPackageUpdateInput) {
    const tour = await prisma.tourPackage.update({
      where: { id },
      data
    });
    return {
      ...tour,
      basePrice: tour.basePrice.toNumber(),
      childPrice: tour.childPrice ? tour.childPrice.toNumber() : null,
      infantPrice: tour.infantPrice ? tour.infantPrice.toNumber() : null,
    };
  }

  static async countSchedules(tourId: string) {
    return prisma.tourSchedule.count({
      where: { tourPackageId: tourId }
    });
  }

  static async archiveTour(id: string) {
    return prisma.tourPackage.update({
      where: { id },
      data: { status: 'ARCHIVED', isFeatured: false }
    });
  }
}
