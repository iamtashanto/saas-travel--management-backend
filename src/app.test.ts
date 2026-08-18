import request from 'supertest';
import app from './app';
import { prisma } from './config/database';
import { redis } from './config/redis';

describe('App', () => {
  afterAll(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('GET /unknown-route', () => {
    it('should return 404', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
