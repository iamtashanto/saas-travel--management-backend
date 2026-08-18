import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  /**
   * Find an active user globally by email (assumes email is unique enough for login lookup
   * or we check all organizations. In this multi-tenant system, user login might need
   * an org slug or we find the first user with this email).
   * Note: The requirements state "Find user by organization-independent login identity if the login flow supports email discovery."
   * We will return all users with this email to handle potential collisions or 
   * just return the first active one for simplicity in this phase.
   */
  static async findActiveUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });
  }

  static async updateFailedLoginAttempts(userId: string, attempts: number, lockedUntil: Date | null) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil,
      },
    });
  }

  static async recordSuccessfulLogin(userId: string, ip: string, userAgent: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        lastLoginUserAgent: userAgent,
      },
    });
  }

  static async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({ data });
  }
}
