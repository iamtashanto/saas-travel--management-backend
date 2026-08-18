import { Router } from 'express';
import { TourOperationController, changeStatusSchema } from './tour-operation.controller';
import { TravelerOperationsController, checkInSchema } from './traveler-operations.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/schedules/:scheduleId', requirePermission('tour.operations.view'), TourOperationController.getOperationBySchedule);
router.get('/schedules/:scheduleId/readiness', requirePermission('tour.operations.view'), TourOperationController.getReadiness);
router.patch('/:id/status', requirePermission('tour.operations.manage'), validateRequest(changeStatusSchema), TourOperationController.changeStatus);
router.patch('/checklist-items/:itemId', requirePermission('tour.operations.manage'), TourOperationController.updateChecklistItem);

// Traveler Operations
router.get('/schedules/:scheduleId/travelers', requirePermission('tour.operations.view'), TravelerOperationsController.listTravelers);
router.post('/schedules/:scheduleId/check-in', requirePermission('tour.operations.manage'), validateRequest(checkInSchema), TravelerOperationsController.checkIn);
router.post('/schedules/:scheduleId/board', requirePermission('tour.operations.manage'), validateRequest(checkInSchema), TravelerOperationsController.board);

export const tourOperationRoutes = router;
