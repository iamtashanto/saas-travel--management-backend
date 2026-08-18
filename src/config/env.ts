import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((p) => parseInt(p, 10))
    .default('5000'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // Auth Policies
  PASSWORD_RESET_EXPIRES_IN: z.string().default('30m'),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().default('24h'),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default('5'),
  LOGIN_LOCK_DURATION_MINUTES: z.string().transform(Number).default('15'),
  REQUIRE_EMAIL_VERIFICATION: z.string().transform(s => s === 'true').default('true'),
  
  // Rate Limits
  AUTH_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 mins
  AUTH_RATE_LIMIT_MAX: z.string().transform(Number).default('50'),
  
  // General Config
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
  APP_URL: z.string().url().default('http://localhost:5000'),
  STORAGE_PROVIDER: z.string().default('local'),
  STORAGE_BUCKET: z.string().default('travel-saas-bucket'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
