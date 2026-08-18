import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class OrganizationRepository {
  static async getOrganizationById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        legalName: true,
        email: true,
        phone: true,
        website: true,
        logoUrl: true,
        defaultCurrency: true,
        timezone: true,
        countryCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  static async updateOrganization(id: string, data: Prisma.OrganizationUpdateInput) {
    return prisma.organization.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        legalName: true,
        email: true,
        phone: true,
        website: true,
        logoUrl: true,
        defaultCurrency: true,
        timezone: true,
        countryCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  static async getOrganizationSettings(organizationId: string) {
    return prisma.organizationSettings.findUnique({
      where: { organizationId },
    });
  }

  static async updateOrganizationSettings(organizationId: string, data: Prisma.OrganizationSettingsUpdateInput) {
    return prisma.organizationSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ...(data as any) // in upsert create needs explicit data, but since we assume settings exist, we actually just update or create default. 
        // Prisma upsert create expects all fields. Let's just use update since Phase 03 guarantees settings creation on register.
      },
      update: data,
    });
  }

  static async getOrganizationStats(organizationId: string) {
    const [totalUsers, activeUsers, totalRoles] = await Promise.all([
      prisma.user.count({ where: { organizationId, deletedAt: null } }),
      prisma.user.count({ where: { organizationId, status: 'ACTIVE', deletedAt: null } }),
      prisma.role.count({ where: { organizationId } }),
    ]);

    return { totalUsers, activeUsers, totalRoles };
  }

  static async getOrganizationSecurityStats(organizationId: string) {
    const activeSessionCount = await prisma.authSession.count({
      where: { organizationId, revokedAt: null, expiresAt: { gt: new Date() } }
    });

    const activeUserCount = await prisma.user.count({
      where: { organizationId, status: 'ACTIVE', deletedAt: null }
    });

    return { activeUserCount, activeSessionCount };
  }
}
