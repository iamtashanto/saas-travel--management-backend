import { RoleRepository } from './role.repository';
import { CreateRoleInput, UpdateRoleInput, RoleResponse } from './role.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { PermissionService } from '../permissions/permission.service';

export class RoleService {
  static async getRoles(organizationId: string): Promise<RoleResponse[]> {
    const roles = await RoleRepository.getRoles(organizationId);
    return roles.map(role => ({
      ...role,
      permissions: role.permissions.map(rp => rp.permission.key)
    }));
  }

  static async getRole(roleId: string, organizationId: string): Promise<RoleResponse> {
    const role = await RoleRepository.getRoleById(roleId, organizationId);
    if (!role) {
      throw new AppError(404, 'NOT_FOUND', 'Role not found');
    }
    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission.key)
    };
  }

  static async createRole(
    organizationId: string, 
    data: CreateRoleInput,
    actorUserId: string
  ): Promise<RoleResponse> {
    // Check if slug exists in org
    const existing = await RoleRepository.getRoleBySlug(data.slug, organizationId);
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Role with this slug already exists in the organization');
    }

    let validPermissionIds: string[] = [];
    
    if (data.permissionKeys && data.permissionKeys.length > 0) {
      const perms = await prisma.permission.findMany({
        where: { key: { in: data.permissionKeys } }
      });
      if (perms.length !== data.permissionKeys.length) {
        throw new AppError(400, 'VALIDATION_ERROR', 'One or more invalid permission keys');
      }
      validPermissionIds = perms.map(p => p.id);
    }

    const role = await RoleRepository.createRole({
      organization: { connect: { id: organizationId } },
      name: data.name,
      slug: data.slug,
      description: data.description,
      isSystem: false, // Tenant admins can only create custom roles
    }, validPermissionIds);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ROLE_CREATED',
        module: 'roles',
        entityType: 'Role',
        entityId: role.id,
        newValues: { name: role.name, slug: role.slug, permissions: data.permissionKeys || [] } as any,
      }
    });

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission.key)
    };
  }

  static async updateRole(
    roleId: string, 
    organizationId: string, 
    data: UpdateRoleInput,
    actorUserId: string
  ): Promise<RoleResponse> {
    const role = await RoleRepository.getRoleById(roleId, organizationId);
    if (!role) throw new AppError(404, 'NOT_FOUND', 'Role not found');

    const updated = await RoleRepository.updateRole(roleId, data);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ROLE_UPDATED',
        module: 'roles',
        entityType: 'Role',
        entityId: role.id,
        oldValues: { name: role.name, description: role.description } as any,
        newValues: data as any,
      }
    });

    return {
      ...updated,
      permissions: updated.permissions.map(rp => rp.permission.key)
    };
  }

  static async deleteRole(roleId: string, organizationId: string, actorUserId: string): Promise<void> {
    const role = await RoleRepository.getRoleById(roleId, organizationId);
    if (!role) throw new AppError(404, 'NOT_FOUND', 'Role not found');

    if (role.isSystem) {
      throw new AppError(403, 'SYSTEM_ROLE_PROTECTED', 'System roles cannot be deleted');
    }

    const count = await RoleRepository.countRoleUsers(roleId);
    if (count > 0) {
      throw new AppError(409, 'ROLE_IN_USE', 'Role cannot be deleted because it is assigned to users');
    }

    await RoleRepository.deleteRole(roleId);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ROLE_DELETED',
        module: 'roles',
        entityType: 'Role',
        entityId: roleId,
        oldValues: { name: role.name, slug: role.slug } as any,
      }
    });
  }

  static async updatePermissions(
    roleId: string, 
    organizationId: string, 
    permissionKeys: string[],
    actorUserId: string
  ): Promise<RoleResponse> {
    const role = await RoleRepository.getRoleById(roleId, organizationId);
    if (!role) throw new AppError(404, 'NOT_FOUND', 'Role not found');

    const perms = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } }
    });

    if (perms.length !== permissionKeys.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'One or more invalid permission keys');
    }

    const updated = await RoleRepository.updateRolePermissions(roleId, perms.map(p => p.id));

    // For system roles like OWNER, we might need explicit checks if they are allowed to lose permissions. 
    // But owner usually gets all explicitly or bypassing checks. 

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'ROLE_PERMISSIONS_UPDATED',
        module: 'roles',
        entityType: 'Role',
        entityId: role.id,
        oldValues: { permissions: role.permissions.map(p => p.permission.key) } as any,
        newValues: { permissions: permissionKeys } as any,
      }
    });

    return {
      ...(updated as any),
      permissions: (updated as any).permissions.map((rp: any) => rp.permission.key)
    };
  }
}
