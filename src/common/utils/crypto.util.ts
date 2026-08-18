import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token.
 * Default length is 32 bytes, converted to hex (64 chars).
 */
export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hashes a given string token using SHA-256.
 * Useful for storing refresh tokens, verification tokens, etc.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
