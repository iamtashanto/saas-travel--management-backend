import { DestinationRepository } from './destination.repository';
import { CreateDestinationInput, UpdateDestinationInput, ListDestinationsQuery } from './destination.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import slugify from 'slugify';

export class DestinationService {
  static async listDestinations(organizationId: string, query: ListDestinationsQuery) {
    return DestinationRepository.listDestinations(organizationId, query);
  }

  static async getDestination(id: string, organizationId: string) {
    const dest = await DestinationRepository.getDestinationById(id, organizationId);
    if (!dest) throw new AppError(404, 'DESTINATION_NOT_FOUND', 'Destination not found');
    return dest;
  }

  static async createDestination(organizationId: string, data: CreateDestinationInput, actorUserId: string) {
    let slug = data.slug;
    if (!slug) {
      slug = slugify(data.name!, { lower: true, strict: true });
    }

    const existing = await DestinationRepository.getDestinationBySlug(slug, organizationId);
    if (existing) {
      throw new AppError(409, 'DESTINATION_SLUG_EXISTS', 'Destination with this slug already exists');
    }

    const dest = await DestinationRepository.createDestination({
      ...data,
      slug,
      organization: { connect: { id: organizationId } }
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'DESTINATION_CREATED',
        module: 'destinations',
        entityType: 'Destination',
        entityId: dest.id,
      }
    });

    return dest;
  }

  static async updateDestination(id: string, organizationId: string, data: UpdateDestinationInput, actorUserId: string) {
    const dest = await this.getDestination(id, organizationId);

    if (data.slug && data.slug !== dest.slug) {
      const existing = await DestinationRepository.getDestinationBySlug(data.slug, organizationId);
      if (existing) {
        throw new AppError(409, 'DESTINATION_SLUG_EXISTS', 'Destination with this slug already exists');
      }
    }

    const updated = await DestinationRepository.updateDestination(id, data as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'DESTINATION_UPDATED',
        module: 'destinations',
        entityType: 'Destination',
        entityId: id,
        oldValues: { name: dest.name, slug: dest.slug, status: dest.status } as any,
      }
    });

    return updated;
  }

  static async deleteDestination(id: string, organizationId: string, actorUserId: string) {
    await this.getDestination(id, organizationId);

    const tourCount = await DestinationRepository.countToursByDestination(id);
    
    if (tourCount > 0) {
      await DestinationRepository.archiveDestination(id);
      
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'DESTINATION_ARCHIVED',
          module: 'destinations',
          entityType: 'Destination',
          entityId: id,
          metadata: { reason: 'DESTINATION_IN_USE' } as any,
        }
      });
      return { archived: true };
    }

    await DestinationRepository.deleteDestination(id);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'DESTINATION_DELETED',
        module: 'destinations',
        entityType: 'Destination',
        entityId: id,
      }
    });
    
    return { archived: false };
  }
}
