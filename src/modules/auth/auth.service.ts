import { prisma } from '../../config/database';
import { AppError } from '../../common/errors/AppError';
import { AuthRepository } from './auth.repository';
import { SessionService } from './session.service';
import { PasswordService } from './password.service';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
import { RegisterInput, LoginInput, AuthResponse, ResetPasswordInput, ChangePasswordInput } from './auth.types';
import { env } from '../../config/env';
import { verifyRefreshToken } from '../../common/utils/jwt.util';
import { hashToken } from '../../common/utils/crypto.util';

export class AuthService {
  static async register(data: RegisterInput): Promise<{ message: string }> {
    // Check if slug is unique
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.organization.slug }
    });

    if (existingOrg) {
      throw new AppError(409, 'CONFLICT', 'Organization slug is already in use');
    }

    const passwordHash = await PasswordService.hash(data.user.password);

    // Atomic transaction to create Org, Settings, Role, User, and UserRole
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.organization.name,
          slug: data.organization.slug,
          settings: {
            create: {} // default settings
          }
        }
      });

      const ownerRole = await tx.role.create({
        data: {
          organizationId: org.id,
          name: 'Owner',
          slug: 'owner',
          description: 'Organization Owner',
          isSystem: true
        }
      });

      const allPermissions = await tx.permission.findMany();
      if (allPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: allPermissions.map(p => ({
            roleId: ownerRole.id,
            permissionId: p.id
          }))
        });
      }

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          name: data.user.name,
          email: data.user.email,
          passwordHash,
          status: 'ACTIVE', // They are active immediately, though they may need email verification
        }
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: ownerRole.id
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: 'USER_REGISTERED',
          module: 'auth',
          entityType: 'User',
          entityId: user.id,
        }
      });

      if (env.REQUIRE_EMAIL_VERIFICATION) {
        // We do this inside or outside the transaction. Better outside to not block the DB if email service is slow.
        // But for simplicity, we trigger the token creation in the transaction, sending outside.
      }
    });

    // After transaction, send verification email
    if (env.REQUIRE_EMAIL_VERIFICATION) {
      const createdUser = await AuthRepository.findActiveUserByEmail(data.user.email);
      if (createdUser) {
        await EmailVerificationService.sendVerificationEmail(createdUser.id, createdUser.email).catch(console.error);
      }
    }

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  static async login(data: LoginInput, ip: string, userAgent: string): Promise<AuthResponse> {
    const user = await AuthRepository.findActiveUserByEmail(data.email);

    if (!user || user.deletedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new AppError(403, 'FORBIDDEN', 'Account is suspended or deactivated.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(401, 'UNAUTHORIZED', 'Account is temporarily locked. Please try again later.');
    }

    if (env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerifiedAt) {
      throw new AppError(403, 'FORBIDDEN', 'Please verify your email address before logging in.');
    }

    const isPasswordValid = await PasswordService.verify(data.password, user.passwordHash);

    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      let lockedUntil = null;
      if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + env.LOGIN_LOCK_DURATION_MINUTES * 60 * 1000);
      }
      
      await AuthRepository.updateFailedLoginAttempts(user.id, attempts, lockedUntil);
      
      await AuthRepository.createAuditLog({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entityType: 'User',
        entityId: user.id,
      });

      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password.');
    }

    // Successful login
    await AuthRepository.recordSuccessfulLogin(user.id, ip, userAgent);
    
    await AuthRepository.createAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      module: 'auth',
      entityType: 'User',
      entityId: user.id,
    });

    const { accessToken, refreshToken } = await SessionService.createSession(
      user.id,
      user.organizationId,
      ip,
      userAgent
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId
      }
    };
  }

  static async refresh(refreshToken: string, ip: string, userAgent: string): Promise<AuthResponse> {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const session = await prisma.authSession.findUnique({
      where: { id: decoded.sessionId }
    });

    if (!session) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid session');
    }

    if (session.revokedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'Session revoked');
    }

    if (session.refreshTokenHash !== tokenHash) {
      // Refresh Token Reuse Detected
      await SessionService.revokeAllSessions(session.userId);
      await AuthRepository.createAuditLog({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        module: 'auth',
        entityType: 'AuthSession',
        entityId: session.id,
      });
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid session or token reuse detected');
    }

    const user = await AuthRepository.findUserById(session.userId);
    if (!user || user.deletedAt || user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw new AppError(401, 'UNAUTHORIZED', 'Account is no longer active');
    }

    // Rotate
    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() } // old session invalid
    });

    const newTokens = await SessionService.createSession(
      user.id,
      user.organizationId,
      ip,
      userAgent
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId
      }
    };
  }

  static async logout(sessionId: string, userId: string): Promise<void> {
    await SessionService.revokeSession(sessionId, userId);
  }

  static async logoutAll(userId: string): Promise<void> {
    await SessionService.revokeAllSessions(userId);
  }

  static async verifyEmail(token: string): Promise<void> {
    await EmailVerificationService.verifyToken(token);
  }

  static async resendVerification(email: string): Promise<void> {
    const user = await AuthRepository.findActiveUserByEmail(email);
    if (!user || user.emailVerifiedAt) return;
    await EmailVerificationService.sendVerificationEmail(user.id, user.email).catch(console.error);
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await AuthRepository.findActiveUserByEmail(email);
    if (!user) return;
    await PasswordResetService.sendResetEmail(user.id, user.email).catch(console.error);
  }

  static async resetPassword(data: ResetPasswordInput): Promise<void> {
    const userId = await PasswordResetService.verifyAndUseToken(data.token);
    const passwordHash = await PasswordService.hash(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() }
    });

    await SessionService.revokeAllSessions(userId);
  }

  static async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await AuthRepository.findUserById(userId);
    if (!user || user.deletedAt) throw new AppError(404, 'NOT_FOUND', 'User not found');

    const isValid = await PasswordService.verify(data.currentPassword, user.passwordHash);
    if (!isValid) throw new AppError(401, 'UNAUTHORIZED', 'Incorrect current password');

    const passwordHash = await PasswordService.hash(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordChangedAt: new Date() }
    });

    await SessionService.revokeAllSessions(userId);
  }
}


