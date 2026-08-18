import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import {
  vehicleSchema,
  vehicleDocumentSchema,
  vehicleTripLogSchema,
  vehicleFuelRecordSchema,
  vehicleMaintenanceSchema,
  vehicleRentalSchema
} from './vehicle.validation';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.vehicles.view'), VehicleController.list);
router.get('/:id', requirePermission('tour.vehicles.view'), VehicleController.get);
router.post('/', requirePermission('tour.vehicles.manage'), validateRequest(vehicleSchema), VehicleController.create);
router.patch('/:id', requirePermission('tour.vehicles.manage'), validateRequest(vehicleSchema.partial()), VehicleController.update);
router.delete('/:id', requirePermission('tour.vehicles.manage'), VehicleController.delete);

// Extensions
router.post('/:id/documents', requirePermission('tour.vehicles.manage'), validateRequest(vehicleDocumentSchema), VehicleController.addDocument);
router.post('/:id/trip-logs', requirePermission('tour.vehicles.manage'), validateRequest(vehicleTripLogSchema), VehicleController.addTripLog);
router.post('/:id/fuel-records', requirePermission('tour.vehicles.manage'), validateRequest(vehicleFuelRecordSchema), VehicleController.addFuelRecord);
router.post('/:id/maintenance', requirePermission('tour.vehicles.manage'), validateRequest(vehicleMaintenanceSchema), VehicleController.addMaintenance);
router.post('/:id/rentals', requirePermission('tour.vehicles.manage'), validateRequest(vehicleRentalSchema), VehicleController.addRental);

export const vehicleRoutes = router;
