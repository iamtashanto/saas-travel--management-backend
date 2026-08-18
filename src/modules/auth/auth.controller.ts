import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AppError } from '../../common/errors/AppError';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Registration successful'
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await AuthService.login(req.body, ip, userAgent);
  res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful'
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await AuthService.refresh(req.body.refreshToken, ip, userAgent);
  res.status(200).json({
    success: true,
    data: result,
    message: 'Token refreshed successfully'
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth) {
    await AuthService.logout(req.auth.sessionId, req.auth.userId);
  }
  res.status(200).json({
    success: true,
    data: {},
    message: 'Logged out successfully'
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth) {
    await AuthService.logoutAll(req.auth.userId);
  }
  res.status(200).json({
    success: true,
    data: {},
    message: 'All sessions revoked successfully'
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // If we reach here, requireAuth middleware guarantees req.auth exists
  // but let's re-fetch the user profile if needed, or just return basic info.
  // For now, we'll return the token payload info. A dedicated user service can fetch full profile.
  res.status(200).json({
    success: true,
    data: req.auth,
    message: 'Current authenticated context'
  });
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  
  const sessions = await SessionService.getActiveSessions(req.auth.userId);
  const mapped = sessions.map(s => ({
    ...s,
    current: s.id === req.auth?.sessionId
  }));

  res.status(200).json({
    success: true,
    data: mapped,
    message: 'Active sessions retrieved'
  });
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  const { sessionId } = req.params;

  await AuthService.logout(sessionId, req.auth.userId);
  
  res.status(200).json({
    success: true,
    data: {},
    message: 'Session revoked successfully'
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.body.token);
  res.status(200).json({
    success: true,
    data: {},
    message: 'Email verified successfully'
  });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resendVerification(req.body.email);
  res.status(200).json({
    success: true,
    data: {},
    message: 'If the account requires verification, a verification message will be sent.'
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    data: {},
    message: 'If an account exists for this email, password reset instructions will be sent.'
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);
  res.status(200).json({
    success: true,
    data: {},
    message: 'Password reset successfully'
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  await AuthService.changePassword(req.auth.userId, req.body);
  res.status(200).json({
    success: true,
    data: {},
    message: 'Password changed successfully'
  });
});
