import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
  sessionId: string;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  organizationId: string;
  sessionId: string;
  tokenType: 'refresh';
}

export const generateAccessToken = (payload: Omit<AccessTokenPayload, 'tokenType'>): string => {
  return jwt.sign({ ...payload, tokenType: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'tokenType'>): string => {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (decoded.tokenType !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (decoded.tokenType !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
};
