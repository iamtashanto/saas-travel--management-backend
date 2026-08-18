import { prisma } from '../../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';

export class PublicTourService {
  static async listPublicTours(organizationId: string, query: any) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.TourPackageWhereInput = {
      organizationId,
      status: 'PUBLISHED',
    };

    if (query.destinationId) where.destinationId = query.destinationId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.featured === 'true') where.isFeatured = true;
    if (query.duration) where.durationDays = Number(query.duration);

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) where.basePrice.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.basePrice.lte = Number(query.maxPrice);
    }

    // Date filtering: tour must have at least one open schedule matching the date
    if (query.date) {
      where.schedules = {
        some: {
          startDate: { gte: new Date(query.date) },
          status: 'OPEN'
        }
      };
    }

    const [total, items] = await Promise.all([
      prisma.tourPackage.count({ where }),
      prisma.tourPackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          coverImageUrl: true,
          durationDays: true,
          durationNights: true,
          basePrice: true,
          isFeatured: true,
          destination: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          // No internal notes, createdBy, etc.
        }
      })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        basePrice: item.basePrice.toNumber(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getPublicTour(slug: string, organizationId: string) {
    const tour = await prisma.tourPackage.findFirst({
      where: { slug, organizationId, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        coverImageUrl: true,
        durationDays: true,
        durationNights: true,
        basePrice: true,
        childPrice: true,
        infantPrice: true,
        currency: true,
        isFeatured: true,
        destination: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        seo: { select: { metaTitle: true, metaDescription: true, canonicalUrl: true, ogTitle: true, ogDescription: true, ogImageUrl: true, indexable: true }},
        media: { select: { id: true, mediaType: true, url: true, altText: true, caption: true, isPrimary: true }, orderBy: { sortOrder: 'asc' }},
        itinerary: { select: { id: true, dayNumber: true, time: true, title: true, description: true, location: true, imageUrl: true }, orderBy: [{ dayNumber: 'asc' }, { sortOrder: 'asc' }]},
        inclusions: { select: { id: true, title: true, description: true }, orderBy: { sortOrder: 'asc' }},
        exclusions: { select: { id: true, title: true, description: true }, orderBy: { sortOrder: 'asc' }},
        addons: { select: { id: true, name: true, description: true, price: true, currency: true }, where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' }},
        schedules: { 
          select: { id: true, startDate: true, endDate: true, departureTime: true, returnTime: true, capacity: true, basePriceOverride: true, adultPrice: true, childPrice: true, infantPrice: true, status: true },
          where: { startDate: { gte: new Date() }, status: 'OPEN' },
          orderBy: { startDate: 'asc' },
          take: 10
        }
      }
    });

    if (!tour) throw new AppError(404, 'TOUR_NOT_FOUND', 'Tour not found or not published');

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
        availabilityCalculation: "NOT_AVAILABLE_UNTIL_BOOKING_MODULE"
      }))
    };
  }
}
