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

// Phase 08 routes
import { corporateClientRoutes } from '../modules/corporate-clients/corporate-client.routes';
import { corporateContactRoutes } from '../modules/corporate-clients/corporate-contact.routes';
import { leadRoutes } from '../modules/sales-crm/lead.routes';
import { salesActivityRoutes } from '../modules/sales-crm/sales-activity.routes';
import { customTourRequestRoutes } from '../modules/sales-crm/custom-tour-request.routes';
import { quotationRoutes } from '../modules/quotations/quotation.routes';
import { approvalRoutes } from '../modules/quotations/approval.routes';
import { proposalRoutes } from '../modules/proposals/proposal.routes';
import { contractRoutes } from '../modules/contracts/contract.routes';
import { corporateReportRoutes } from '../modules/corporate-reports/corporate-report.routes';

// Phase 11 routes
import { operationsRoutes } from '../modules/tour-operations/operations.routes';
import { procurementRoutes } from '../modules/procurement/procurement.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';

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

// Phase 08
router.use('/corporate-clients', corporateClientRoutes);
router.use('/corporate-clients', corporateContactRoutes); // Mounts to /:clientId/contacts
router.use('/leads', leadRoutes);
router.use('/sales-activities', salesActivityRoutes);
router.use('/custom-tour-requests', customTourRequestRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/proposals', proposalRoutes);
router.use('/contracts', contractRoutes);
router.use('/reports/corporate', corporateReportRoutes);

// Phase 11
router.use('/operations', operationsRoutes);
router.use('/procurement', procurementRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
