import { Router } from 'express';
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
  }),
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
  }),
);

import { authRoutes } from '../modules/auth/auth.routes';
import { organizationRoutes } from '../modules/organizations/organization.routes';
import { staffRoutes } from '../modules/staff/staff.routes';
import { roleRoutes } from '../modules/roles/role.routes';
import { permissionRoutes } from '../modules/permissions/permission.routes';
import { meRoutes } from '../modules/me/me.routes';

// ... existing health routes ...

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/me', meRoutes);

export default router;
