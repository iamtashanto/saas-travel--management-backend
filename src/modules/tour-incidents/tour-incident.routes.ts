import { Router } from 'express';
import { TourIncidentController, incidentSchema, updateIncidentStatusSchema } from './tour-incident.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.operations.view'), TourIncidentController.list);
router.post('/', requirePermission('tour.operations.manage'), validateRequest(incidentSchema), TourIncidentController.report);
router.patch('/:id/status', requirePermission('tour.operations.manage'), validateRequest(updateIncidentStatusSchema), TourIncidentController.updateStatus);

export const tourIncidentRoutes = router;
