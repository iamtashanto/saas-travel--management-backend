import { Router } from 'express';
import { DriverController, driverSchema } from './driver.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.drivers.view'), DriverController.list);
router.post('/', requirePermission('tour.drivers.manage'), validateRequest(driverSchema), DriverController.create);
router.patch('/:id', requirePermission('tour.drivers.manage'), validateRequest(driverSchema.partial()), DriverController.update);
router.delete('/:id', requirePermission('tour.drivers.manage'), DriverController.delete);

export const driverRoutes = router;
