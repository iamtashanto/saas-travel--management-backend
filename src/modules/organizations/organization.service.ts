import { OrganizationRepository } from './organization.repository';
import { UpdateOrganizationInput, UpdateOrganizationSettingsInput, OrganizationResponse } from './organization.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';

export class OrganizationService {
  static async getOrganization(organizationId: string): Promise<OrganizationResponse> {
    const org = await OrganizationRepository.getOrganizationById(organizationId);
    if (!org) {
      throw new AppError(404, 'NOT_FOUND', 'Organization not found');
    }
    return org;
  }

  static async updateOrganization(
    organizationId: string, 
    data: UpdateOrganizationInput,
    actorUserId: string
  ): Promise<OrganizationResponse> {
    // Basic Timezone validation
    if (data.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: data.timezone });
      } catch (e) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid IANA timezone');
      }
    }

    const oldOrg = await OrganizationRepository.getOrganizationById(organizationId);
    
    const org = await OrganizationRepository.updateOrganization(organizationId, data);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ORGANIZATION_UPDATED',
        module: 'organization',
        entityType: 'Organization',
        entityId: organizationId,
        oldValues: oldOrg as any,
        newValues: org as any,
      }
    });

    return org;
  }

  static async getSettings(organizationId: string) {
    const settings = await OrganizationRepository.getOrganizationSettings(organizationId);
    if (!settings) {
      throw new AppError(404, 'NOT_FOUND', 'Organization settings not found');
    }
    return settings;
  }

  static async updateSettings(
    organizationId: string, 
    data: UpdateOrganizationSettingsInput,
    actorUserId: string
  ) {
    const oldSettings = await OrganizationRepository.getOrganizationSettings(organizationId);

    const settings = await OrganizationRepository.updateOrganizationSettings(organizationId, data);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ORGANIZATION_SETTINGS_UPDATED',
        module: 'organization',
        entityType: 'OrganizationSettings',
        entityId: settings.id,
        oldValues: oldSettings as any,
        newValues: settings as any,
      }
    });

    return settings;
  }

  static async getStats(organizationId: string) {
    return OrganizationRepository.getOrganizationStats(organizationId);
  }

  static async getSecurityStats(organizationId: string) {
    return OrganizationRepository.getOrganizationSecurityStats(organizationId);
  }
}
