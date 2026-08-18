import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListStaffQuery } from './staff.types';

export class StaffRepository {
  static async listStaff(organizationId: string, query: ListStaffQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (query.status) where.status = query.status;
    
    if (query.roleId) {
      where.userRoles = {
        some: { roleId: query.roleId }
      };
    }

    if (query.search) {
      const searchStr = query.search.toLowerCase();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { phone: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sort || 'createdAt']: query.order || 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          status: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: {
              role: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        }
      })
    ]);

    return {
      items: users.map(user => ({
        ...user,
        roles: user.userRoles.map(ur => ur.role),
        userRoles: undefined // clean up response
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getStaffById(userId: string, organizationId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    if (!user) return null;

    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      userRoles: undefined
    };
  }

  static async updateStaff(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async deleteStaff(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'DEACTIVATED'
      }
    });
  }

  static async getInvitationById(id: string, organizationId: string) {
    return prisma.organizationInvitation.findFirst({
      where: { id, organizationId }
    });
  }

  static async createInvitation(data: Prisma.OrganizationInvitationCreateInput) {
    return prisma.organizationInvitation.create({ data });
  }

  static async listInvitations(organizationId: string) {
    return prisma.organizationInvitation.findMany({
      where: { organizationId, acceptedAt: null, cancelledAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async countOwners(organizationId: string) {
    return prisma.userRole.count({
      where: {
        role: { organizationId, slug: 'owner' },
        user: { status: 'ACTIVE', deletedAt: null }
      }
    });
  }

  static async isUserOwner(userId: string, organizationId: string) {
    const count = await prisma.userRole.count({
      where: {
        userId,
        role: { organizationId, slug: 'owner' }
      }
    });
    return count > 0;
  }
}
