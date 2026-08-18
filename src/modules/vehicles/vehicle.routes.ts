import { Router } from 'express';
import { VehicleController, vehicleSchema } from './vehicle.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.vehicles.view'), VehicleController.list);
router.post('/', requirePermission('tour.vehicles.manage'), validateRequest(vehicleSchema), VehicleController.create);
router.patch('/:id', requirePermission('tour.vehicles.manage'), validateRequest(vehicleSchema.partial()), VehicleController.update);
router.delete('/:id', requirePermission('tour.vehicles.manage'), VehicleController.delete);

export const vehicleRoutes = router;
