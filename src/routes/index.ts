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
import { destinationRoutes } from '../modules/destinations/destination.routes';
import { tourCategoryRoutes } from '../modules/tour-categories/category.routes';
import { pickupPointRoutes } from '../modules/pickup-points/pickup-point.routes';
import { tourRoutes } from '../modules/tours/tour.routes';
import { publicRoutes } from '../modules/public/tour/public-tour.routes';
import { publicBookingRoutes } from '../modules/public/booking/public-booking.routes';
import { customerRoutes } from '../modules/customers/customer.routes';
import { travelerRoutes } from '../modules/travelers/traveler.routes';
import { bookingRoutes } from '../modules/bookings/booking.routes';

// Phase 07 routes
import { vehicleRoutes } from '../modules/vehicles/vehicle.routes';
import { driverRoutes } from '../modules/drivers/driver.routes';
import { guideRoutes } from '../modules/guides/guide.routes';
import { hotelRoutes } from '../modules/hotels/hotel.routes';
import { tourOperationRoutes } from '../modules/tour-operations/tour-operation.routes';
import { resourceAssignmentRoutes } from '../modules/resource-assignments/resource-assignment.routes';
import { tourIncidentRoutes } from '../modules/tour-incidents/tour-incident.routes';
import { tourManifestRoutes } from '../modules/tour-manifests/tour-manifest.routes';
// ... existing health routes ...

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/me', meRoutes);

// Phase 05 routes
router.use('/destinations', destinationRoutes);
router.use('/tour-categories', tourCategoryRoutes);
router.use('/pickup-points', pickupPointRoutes);
router.use('/tours', tourRoutes);
router.use('/public', publicRoutes);
router.use('/public/bookings', publicBookingRoutes);

// Phase 06 routes
router.use('/customers', customerRoutes);
router.use('/travelers', travelerRoutes);
router.use('/bookings', bookingRoutes);

// Phase 07
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/guides', guideRoutes);
router.use('/hotels', hotelRoutes);
router.use('/tour-operations', tourOperationRoutes);
router.use('/resource-assignments', resourceAssignmentRoutes);
router.use('/tour-incidents', tourIncidentRoutes);
router.use('/tour-manifests', tourManifestRoutes);

export default router;
