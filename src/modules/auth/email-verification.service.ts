import { prisma } from '../../config/database';
import { generateRandomToken, hashToken } from '../../common/utils/crypto.util';
import { env } from '../../config/env';
import { emailProvider } from './email.service';
import ms from 'ms';

export class EmailVerificationService {
  static async createToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    
    // Parse duration (e.g. "24h") into milliseconds
    const duration = Number(ms(env.EMAIL_VERIFICATION_EXPIRES_IN as any)) || 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + duration);

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      }
    });

    return rawToken;
  }

  static async sendVerificationEmail(userId: string, email: string) {
    const token = await this.createToken(userId);
    await emailProvider.sendVerificationEmail(email, token);
  }

  static async verifyToken(rawToken: string): Promise<string> {
    const tokenHash = hashToken(rawToken);

    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash }
    });

    if (!tokenRecord) {
      throw new Error('Invalid verification token');
    }

    if (tokenRecord.usedAt) {
      throw new Error('Token has already been used');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }

    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerifiedAt: new Date() }
      }),
      prisma.auditLog.create({
        data: {
          action: 'EMAIL_VERIFIED',
          module: 'auth',
          entityType: 'User',
          entityId: tokenRecord.userId,
          userId: tokenRecord.userId,
        }
      })
    ]);

    return tokenRecord.userId;
  }
}
