import { Router } from 'express';
import { CustomTourRequestController, customTourRequestSchema } from './custom-tour-request.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('sales.view'), CustomTourRequestController.list);
router.post('/', requirePermission('sales.manage'), validateRequest(customTourRequestSchema), CustomTourRequestController.create);
router.patch('/:id', requirePermission('sales.manage'), validateRequest(customTourRequestSchema.partial()), CustomTourRequestController.update);

export const customTourRequestRoutes = router;
