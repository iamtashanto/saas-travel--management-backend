import { Router } from 'express';
import { OperationsDashboardController } from './operations.controller';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/dashboard/kanban', requirePermission('tour.operations.view'), OperationsDashboardController.getKanbanBoard);
router.get('/readiness/:scheduleId', requirePermission('tour.operations.view'), OperationsDashboardController.getReadiness);
router.post('/readiness/calculate-all', requirePermission('tour.operations.manage'), OperationsDashboardController.updateReadiness);

export const operationsRoutes = router;
