import { TourRepository } from './tour.repository';
import { CreateTourInput, UpdateTourInput, ListToursQuery } from './tour.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import slugify from 'slugify';

export class TourService {
  static async listTours(organizationId: string, query: ListToursQuery) {
    return TourRepository.listTours(organizationId, query);
  }

  static async getTour(id: string, organizationId: string) {
    const tour = await TourRepository.getTourById(id, organizationId);
    if (!tour) throw new AppError(404, 'TOUR_NOT_FOUND', 'Tour package not found');
    return tour;
  }

  static async createTour(organizationId: string, data: CreateTourInput, actorUserId: string) {
    let slug = data.slug;
    if (!slug) {
      slug = slugify(data.title!, { lower: true, strict: true });
    }

    const existing = await TourRepository.getTourBySlug(slug, organizationId);
    if (existing) {
      throw new AppError(409, 'TOUR_SLUG_EXISTS', 'Tour package with this slug already exists');
    }

    // Verify destination belongs to organization
    const destination = await prisma.destination.findFirst({
      where: { id: data.destinationId, organizationId }
    });
    if (!destination) throw new AppError(404, 'DESTINATION_NOT_FOUND', 'Destination not found in your organization');

    // Verify category belongs to organization
    const category = await prisma.tourCategory.findFirst({
      where: { id: data.categoryId, organizationId }
    });
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found in your organization');

    const tour = await TourRepository.createTour({
      ...data,
      slug,
      status: 'DRAFT',
      organization: { connect: { id: organizationId } },
      destination: { connect: { id: data.destinationId } },
      category: { connect: { id: data.categoryId } },
      createdBy: actorUserId,
      updatedBy: actorUserId,
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'TOUR_CREATED',
        module: 'tours',
        entityType: 'TourPackage',
        entityId: tour.id,
      }
    });

    return tour;
  }

  static async updateTour(id: string, organizationId: string, data: UpdateTourInput, actorUserId: string) {
    const tour = await this.getTour(id, organizationId);

    if (data.slug && data.slug !== tour.slug) {
      const existing = await TourRepository.getTourBySlug(data.slug, organizationId);
      if (existing) {
        throw new AppError(409, 'TOUR_SLUG_EXISTS', 'Tour package with this slug already exists');
      }
    }

    if (data.destinationId && data.destinationId !== tour.destinationId) {
      const destination = await prisma.destination.findFirst({
        where: { id: data.destinationId, organizationId }
      });
      if (!destination) throw new AppError(404, 'DESTINATION_NOT_FOUND', 'Destination not found in your organization');
    }

    if (data.categoryId && data.categoryId !== tour.categoryId) {
      const category = await prisma.tourCategory.findFirst({
        where: { id: data.categoryId, organizationId }
      });
      if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found in your organization');
    }

    const updated = await TourRepository.updateTour(id, {
      ...data,
      updatedBy: actorUserId
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'TOUR_UPDATED',
        module: 'tours',
        entityType: 'TourPackage',
        entityId: id,
        oldValues: { title: tour.title, status: tour.status } as any,
      }
    });

    return updated;
  }

  static async publishTour(id: string, organizationId: string, actorUserId: string) {
    const tour = await this.getTour(id, organizationId);

    if (tour.status === 'PUBLISHED') {
      throw new AppError(400, 'TOUR_ALREADY_PUBLISHED', 'Tour is already published');
    }

    if (tour.status === 'ARCHIVED') {
      throw new AppError(400, 'TOUR_ALREADY_ARCHIVED', 'Cannot publish an archived tour');
    }

    // Validation rules
    const missing: string[] = [];
    if (!tour.title) missing.push('title');
    if (!tour.destinationId) missing.push('destination');
    if (!tour.categoryId) missing.push('category');
    if (!tour.coverImageUrl) missing.push('coverImageUrl');
    if (tour.durationDays < 1) missing.push('durationDays');
    if (tour.basePrice <= 0) missing.push('basePrice');
    
    const scheduleCount = await TourRepository.countSchedules(id);
    if (scheduleCount === 0) missing.push('at least one schedule');

    if (missing.length > 0) {
      throw new AppError(400, 'TOUR_NOT_READY_TO_PUBLISH', `Tour missing required data: ${missing.join(', ')}`);
    }

    const published = await prisma.$transaction(async (tx) => {
      const updated = await tx.tourPackage.update({
        where: { id },
        data: { 
          status: 'PUBLISHED',
          publishedAt: new Date(),
          updatedBy: actorUserId
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'TOUR_PUBLISHED',
          module: 'tours',
          entityType: 'TourPackage',
          entityId: id,
        }
      });

      return updated;
    });

    return published;
  }

  static async unpublishTour(id: string, organizationId: string, actorUserId: string) {
    const tour = await this.getTour(id, organizationId);

    if (tour.status !== 'PUBLISHED') {
      throw new AppError(400, 'INVALID_STATE', 'Only published tours can be unpublished');
    }

    const unpublished = await prisma.$transaction(async (tx) => {
      const updated = await tx.tourPackage.update({
        where: { id },
        data: { 
          status: 'UNPUBLISHED',
          updatedBy: actorUserId
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'TOUR_UNPUBLISHED',
          module: 'tours',
          entityType: 'TourPackage',
          entityId: id,
        }
      });

      return updated;
    });

    return unpublished;
  }

  static async archiveTour(id: string, organizationId: string, actorUserId: string) {
    const tour = await this.getTour(id, organizationId);

    if (tour.status === 'ARCHIVED') {
      throw new AppError(400, 'TOUR_ALREADY_ARCHIVED', 'Tour is already archived');
    }

    const archived = await prisma.$transaction(async (tx) => {
      const updated = await tx.tourPackage.update({
        where: { id },
        data: { 
          status: 'ARCHIVED',
          isFeatured: false,
          updatedBy: actorUserId
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'TOUR_ARCHIVED',
          module: 'tours',
          entityType: 'TourPackage',
          entityId: id,
        }
      });

      return updated;
    });

    return archived;
  }
}
