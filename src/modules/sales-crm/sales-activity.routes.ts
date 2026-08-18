import { Router } from 'express';
import { SalesActivityController, salesActivitySchema } from './sales-activity.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('sales.view'), SalesActivityController.list);
router.post('/', requirePermission('sales.manage'), validateRequest(salesActivitySchema), SalesActivityController.create);
router.patch('/:id', requirePermission('sales.manage'), validateRequest(salesActivitySchema.partial()), SalesActivityController.update);

export const salesActivityRoutes = router;
