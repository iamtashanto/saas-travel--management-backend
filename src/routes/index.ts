import { Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { asyncHandler } from '../common/utils/asyncHandler';

const router = Router();

// Standard Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'travel-business-saas-api',
      version: '1.0.0',
    },
  });
});

// Database Health Check
router.get(
  '/health/database',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'postgresql',
      },
    });
  })
);

// Redis Health Check
router.get(
  '/health/redis',
  asyncHandler(async (req, res) => {
    await redis.ping();
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'redis',
      },
    });
  })
);

export default router;
