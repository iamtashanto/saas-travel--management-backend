import { Router } from 'express';
import { ApprovalController } from './approval.controller';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('quotation.approve'), ApprovalController.list);
router.post('/:id/approve', requirePermission('quotation.approve'), ApprovalController.approve);
router.post('/:id/reject', requirePermission('quotation.approve'), ApprovalController.reject);

export const approvalRoutes = router;
