import { prisma } from '../../config/database';

export class PermissionService {
  /**
   * Retrieves all effective permissions for a user within an organization.
   * Caching could be implemented here later.
   */
  static async getUserPermissions(userId: string, organizationId: string): Promise<Set<string>> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        role: {
          organizationId
        }
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    const permissions = new Set<string>();

    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.key);
      }
    }

    return permissions;
  }

  static async hasPermission(userId: string, organizationId: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.has(requiredPermission);
  }
}
