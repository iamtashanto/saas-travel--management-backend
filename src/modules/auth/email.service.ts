import { logger } from '../../common/utils/logger';

export interface EmailProvider {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
  sendWelcomeEmail(to: string): Promise<void>;
}

export class MockEmailProvider implements EmailProvider {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    logger.info(`[MockEmail] Sending verification email to ${to} with token ${token}`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    logger.info(`[MockEmail] Sending password reset email to ${to} with token ${token}`);
  }

  async sendWelcomeEmail(to: string): Promise<void> {
    logger.info(`[MockEmail] Sending welcome email to ${to}`);
  }
}

// Instantiate a default provider to use throughout the auth module.
export const emailProvider = new MockEmailProvider();
