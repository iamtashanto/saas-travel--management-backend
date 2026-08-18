import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

redis.on('connect', () => {
  if (env.NODE_ENV !== 'test') {
    console.log('✅ Redis Connected successfully');
  }
});
