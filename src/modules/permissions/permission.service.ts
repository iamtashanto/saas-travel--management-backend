import { prisma } from '../../config/database';

export class PermissionService {
  static async getPermissions(moduleFilter?: string) {
    const where = moduleFilter ? { module: moduleFilter } : {};
    return prisma.permission.findMany({
      where,
      orderBy: [
        { module: 'asc' },
        { key: 'asc' }
      ]
    });
  }

  static async validatePermissionKeys(keys: string[]): Promise<boolean> {
    const count = await prisma.permission.count({
      where: { key: { in: keys } }
    });
    return count === keys.length;
  }

  static async getUserPermissions(userId: string, organizationId: string): Promise<Set<string>> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId, role: { organizationId } },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } }
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
}
