import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class RoleRepository {
  static async getRoles(organizationId: string) {
    return prisma.role.findMany({
      where: { organizationId },
      include: {
        permissions: {
          include: { permission: true }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  static async getRoleById(roleId: string, organizationId: string) {
    return prisma.role.findFirst({
      where: { id: roleId, organizationId },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  static async getRoleBySlug(slug: string, organizationId: string) {
    return prisma.role.findUnique({
      where: {
        organizationId_slug: { organizationId, slug }
      }
    });
  }

  static async createRole(data: Prisma.RoleCreateInput, permissionIds: string[]) {
    return prisma.role.create({
      data: {
        ...data,
        permissions: {
          create: permissionIds.map(id => ({ permissionId: id }))
        }
      },
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }

  static async updateRole(roleId: string, data: Prisma.RoleUpdateInput) {
    return prisma.role.update({
      where: { id: roleId },
      data,
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }

  static async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId }
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(id => ({
            roleId,
            permissionId: id
          }))
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: { include: { permission: true } }
        }
      });
    });
  }

  static async deleteRole(roleId: string) {
    return prisma.role.delete({
      where: { id: roleId }
    });
  }

  static async countRoleUsers(roleId: string) {
    return prisma.userRole.count({
      where: { roleId }
    });
  }
}
