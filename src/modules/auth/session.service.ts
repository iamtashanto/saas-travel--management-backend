import { prisma } from '../../config/database';
import { hashToken } from '../../common/utils/crypto.util';
import { generateAccessToken, generateRefreshToken } from '../../common/utils/jwt.util';

export class SessionService {
  static async createSession(userId: string, organizationId: string, ip: string, userAgent: string) {
    const rawRefreshToken = crypto.randomUUID(); // We can also use a proper random token generator, but let's use the one we created or randomUUID for the raw token
    // Actually, our JWT util generates the refresh token. We don't need a random UUID.
    // The JWT is the token, we hash the JWT to store in the DB.
    
    // Create an empty session first to get the sessionId
    const session = await prisma.authSession.create({
      data: {
        userId,
        organizationId,
        refreshTokenHash: '', // temporary
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: ip,
        userAgent,
      }
    });

    // Generate JWTs
    const accessToken = generateAccessToken({
      userId,
      organizationId,
      sessionId: session.id
    });

    const refreshToken = generateRefreshToken({
      userId,
      organizationId,
      sessionId: session.id
    });

    // Hash refresh token and update session
    const hashedToken = hashToken(refreshToken);
    await prisma.authSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: hashedToken }
    });

    return {
      accessToken,
      refreshToken,
      session
    };
  }

  static async revokeSession(sessionId: string, userId: string) {
    return prisma.authSession.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() }
    });
  }

  static async revokeAllSessions(userId: string) {
    return prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  static async getActiveSessions(userId: string) {
    return prisma.authSession.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      }
    });
  }
}
