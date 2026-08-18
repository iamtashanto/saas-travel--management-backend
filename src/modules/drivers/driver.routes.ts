import { Router } from 'express';
import { DriverController } from './driver.controller';
import { driverSchema, driverDutyLogSchema } from './driver.validation';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.drivers.view'), DriverController.list);
router.get('/:id', requirePermission('tour.drivers.view'), DriverController.get);
router.post('/', requirePermission('tour.drivers.manage'), validateRequest(driverSchema), DriverController.create);
router.patch('/:id', requirePermission('tour.drivers.manage'), validateRequest(driverSchema.partial()), DriverController.update);
router.delete('/:id', requirePermission('tour.drivers.manage'), DriverController.delete);

// Extensions
router.post('/:id/duty-logs', requirePermission('tour.drivers.manage'), validateRequest(driverDutyLogSchema), DriverController.addDutyLog);

export const driverRoutes = router;
