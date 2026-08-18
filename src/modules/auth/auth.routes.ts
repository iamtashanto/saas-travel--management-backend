import { Router } from 'express';
import * as authController from './auth.controller';
import * as validation from './auth.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { authRateLimiter } from '../../common/middleware/rate-limit.middleware';

const router = Router();

// To be created: a simple validateRequest middleware to run Zod schemas
// Let's assume we create it in common/middleware/validateRequest.ts

router.post('/register', authRateLimiter, validateRequest(validation.registerSchema), authController.register);
router.post('/login', authRateLimiter, validateRequest(validation.loginSchema), authController.login);
router.post('/refresh', authRateLimiter, validateRequest(validation.refreshSchema), authController.refresh);

router.post('/forgot-password', authRateLimiter, validateRequest(validation.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest(validation.resetPasswordSchema), authController.resetPassword);

router.post('/verify-email', authRateLimiter, validateRequest(validation.verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, validateRequest(validation.resendVerificationSchema), authController.resendVerification);

// Protected routes
router.post('/logout', requireAuth, authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);
router.get('/me', requireAuth, authController.getMe);
router.get('/sessions', requireAuth, authController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, authController.revokeSession);
router.post('/change-password', requireAuth, validateRequest(validation.changePasswordSchema), authController.changePassword);

export const authRoutes = router;
