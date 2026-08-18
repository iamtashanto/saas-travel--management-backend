import request from 'supertest';
import app from './app';
import { prisma } from './config/database';
import { redis } from './config/redis';

// Mock dependencies for testing without Docker
jest.mock('./config/database', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{}]),
    $disconnect: jest.fn(),
  },
}));

jest.mock('./config/redis', () => ({
  redis: {
    ping: jest.fn().mockResolvedValue('PONG'),
    disconnect: jest.fn(),
  },
}));

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

  describe('GET /api/v1/health/database', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/api/v1/health/database');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('GET /api/v1/health/redis', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/api/v1/health/redis');
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
