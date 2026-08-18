import { StaffRepository } from './staff.repository';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { 
  ListStaffQuery, 
  InviteStaffInput, 
  UpdateStaffInput, 
  UpdateStaffStatusInput 
} from './staff.types';
import { generateRandomToken, hashToken } from '../../common/utils/crypto.util';
import { emailProvider } from '../auth/email.service';
import { SessionService } from '../auth/session.service';

export class StaffService {
  static async ensureOrganizationHasOwner(organizationId: string, ignoreUserId?: string) {
    const owners = await StaffRepository.countOwners(organizationId);
    let finalCount = owners;
    
    if (ignoreUserId && await StaffRepository.isUserOwner(ignoreUserId, organizationId)) {
      finalCount -= 1;
    }

    if (finalCount < 1) {
      throw new AppError(403, 'LAST_OWNER_PROTECTION', 'Organization must have at least one active owner');
    }
  }

  static async listStaff(organizationId: string, query: ListStaffQuery) {
    return StaffRepository.listStaff(organizationId, query);
  }

  static async getStaff(userId: string, organizationId: string) {
    const user = await StaffRepository.getStaffById(userId, organizationId);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'Staff member not found');
    return user;
  }

  static async updateStaff(userId: string, organizationId: string, data: UpdateStaffInput, actorUserId: string) {
    const user = await this.getStaff(userId, organizationId);

    const updated = await StaffRepository.updateStaff(userId, data);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'STAFF_PROFILE_UPDATED',
        module: 'staff',
        entityType: 'User',
        entityId: userId,
        oldValues: { name: user.name, phone: user.phone, avatarUrl: user.avatarUrl } as any,
        newValues: data as any,
      }
    });

    return updated;
  }

  static async updateStatus(userId: string, organizationId: string, data: UpdateStaffStatusInput, actorUserId: string) {
    const user = await this.getStaff(userId, organizationId);

    if (userId === actorUserId) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot change your own status');
    }

    if (data.status === 'SUSPENDED' || data.status === 'DEACTIVATED') {
      await this.ensureOrganizationHasOwner(organizationId, userId);
      await SessionService.revokeAllSessions(userId);
    }

    const updated = await StaffRepository.updateStaff(userId, { status: data.status as any });

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: `STAFF_${data.status}`,
        module: 'staff',
        entityType: 'User',
        entityId: userId,
        oldValues: { status: user.status } as any,
        newValues: { status: data.status } as any,
      }
    });

    return updated;
  }

  static async deleteStaff(userId: string, organizationId: string, actorUserId: string) {
    const user = await this.getStaff(userId, organizationId);
    
    if (userId === actorUserId) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot delete yourself');
    }

    await this.ensureOrganizationHasOwner(organizationId, userId);
    await SessionService.revokeAllSessions(userId);

    await StaffRepository.deleteStaff(userId);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'STAFF_DEACTIVATED',
        module: 'staff',
        entityType: 'User',
        entityId: userId,
      }
    });
  }

  static async updateRoles(userId: string, organizationId: string, roleIds: string[], actorUserId: string) {
    await this.getStaff(userId, organizationId);

    // Verify all roles belong to the organization
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds }, organizationId }
    });

    if (roles.length !== roleIds.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'One or more invalid role IDs');
    }

    // Checking owner protection
    const newRolesAreOwner = roles.some(r => r.slug === 'owner');
    if (!newRolesAreOwner) {
      await this.ensureOrganizationHasOwner(organizationId, userId);
    }

    // For safety, we should also check if the actor actually has staff.roles.update (which the middleware handles) 
    // but assigning OWNER is highly sensitive.
    if (newRolesAreOwner) {
      // Must have owner.manage explicitly or just be an owner themselves.
      const isActorOwner = await StaffRepository.isUserOwner(actorUserId, organizationId);
      if (!isActorOwner) {
        throw new AppError(403, 'FORBIDDEN', 'Only owners can assign the OWNER role');
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map(roleId => ({ userId, roleId }))
        });
      }
    });

    await SessionService.revokeAllSessions(userId);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'STAFF_ROLES_UPDATED',
        module: 'staff',
        entityType: 'User',
        entityId: userId,
        newValues: { roleIds } as any,
      }
    });
  }

  static async revokeSessions(userId: string, organizationId: string, actorUserId: string) {
    await this.getStaff(userId, organizationId);
    await SessionService.revokeAllSessions(userId);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'STAFF_SESSIONS_REVOKED',
        module: 'staff',
        entityType: 'User',
        entityId: userId,
      }
    });
  }

  // --- INVITATIONS ---

  static async inviteStaff(organizationId: string, data: InviteStaffInput, actorUserId: string) {
    const emailStr = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: { organizationId, email: emailStr, deletedAt: null }
    });

    if (existingUser) {
      throw new AppError(409, 'CONFLICT', 'User already exists in this organization');
    }

    const roles = await prisma.role.findMany({
      where: { id: { in: data.roleIds }, organizationId }
    });

    if (roles.length !== data.roleIds.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'One or more invalid role IDs');
    }

    // Only owner can invite another owner
    const isOwnerRole = roles.some(r => r.slug === 'owner');
    if (isOwnerRole) {
      const isActorOwner = await StaffRepository.isUserOwner(actorUserId, organizationId);
      if (!isActorOwner) throw new AppError(403, 'FORBIDDEN', 'Only owners can assign the OWNER role');
    }

    // Cancel existing pending invitations
    await prisma.organizationInvitation.updateMany({
      where: { organizationId, email: emailStr, acceptedAt: null, cancelledAt: null },
      data: { cancelledAt: new Date() }
    });

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await StaffRepository.createInvitation({
      organization: { connect: { id: organizationId } },
      email: emailStr,
      roleIds: data.roleIds,
      tokenHash,
      expiresAt,
      invitedBy: actorUserId,
    });

    await emailProvider.sendVerificationEmail(emailStr, rawToken); // Reuse for now, ideally `sendInvitationEmail`

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'STAFF_INVITED',
        module: 'staff',
        entityType: 'OrganizationInvitation',
        entityId: invitation.id,
      }
    });

    return invitation;
  }

  static async listInvitations(organizationId: string) {
    return StaffRepository.listInvitations(organizationId);
  }

  static async cancelInvitation(id: string, organizationId: string, actorUserId: string) {
    const inv = await StaffRepository.getInvitationById(id, organizationId);
    if (!inv || inv.cancelledAt || inv.acceptedAt) {
      throw new AppError(404, 'NOT_FOUND', 'Active invitation not found');
    }

    await prisma.organizationInvitation.update({
      where: { id },
      data: { cancelledAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'INVITATION_CANCELLED',
        module: 'staff',
        entityType: 'OrganizationInvitation',
        entityId: id,
      }
    });
  }
}
