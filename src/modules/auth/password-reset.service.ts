import { prisma } from '../../config/database';
import { generateRandomToken, hashToken } from '../../common/utils/crypto.util';
import { env } from '../../config/env';
import { emailProvider } from './email.service';
import ms from 'ms';

export class PasswordResetService {
  static async createToken(userId: string): Promise<string> {
    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    
    const duration = Number(ms(env.PASSWORD_RESET_EXPIRES_IN as any)) || 30 * 60 * 1000;
    const expiresAt = new Date(Date.now() + duration);

    // Invalidate any existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() } // Mark them as effectively used to invalidate them
    });

    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      }
    });

    return rawToken;
  }

  static async sendResetEmail(userId: string, email: string) {
    const token = await this.createToken(userId);
    await emailProvider.sendPasswordResetEmail(email, token);
  }

  static async verifyAndUseToken(rawToken: string): Promise<string> {
    const tokenHash = hashToken(rawToken);

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!tokenRecord) {
      throw new Error('Invalid or expired password reset token');
    }

    if (tokenRecord.usedAt) {
      throw new Error('Token has already been used');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }

    // Mark as used
    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    });

    return tokenRecord.userId;
  }
}
