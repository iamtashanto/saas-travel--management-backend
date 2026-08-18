import { Router } from 'express';
import { ResourceAssignmentController, assignTransportSchema } from './resource-assignment.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/:scheduleId/transport', requirePermission('tour.operations.view'), ResourceAssignmentController.listTransportAssignments);
router.post('/:scheduleId/transport', requirePermission('tour.operations.manage'), validateRequest(assignTransportSchema), ResourceAssignmentController.assignTransport);

export const resourceAssignmentRoutes = router;
