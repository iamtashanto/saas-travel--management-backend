import { z } from 'zod';
import * as validation from './auth.validation';

export type RegisterInput = z.infer<typeof validation.registerSchema>['body'];
export type LoginInput = z.infer<typeof validation.loginSchema>['body'];
export type RefreshInput = z.infer<typeof validation.refreshSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof validation.forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof validation.resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof validation.changePasswordSchema>['body'];
export type VerifyEmailInput = z.infer<typeof validation.verifyEmailSchema>['body'];
export type ResendVerificationInput = z.infer<typeof validation.resendVerificationSchema>['body'];

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string; // "15m" etc or number
  user: {
    id: string;
    name: string;
    email: string;
    organizationId: string;
  };
}
