import { Router } from 'express';
import { ReferralController } from './referral.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createReferralCodeSchema,
  updateReferralStatusSchema,
} from './referral.validation';

const router = Router();

// Publicly accessible but rate limited validation endpoint
router.post('/record', asyncHandler(ReferralController.recordReferral));

router.use(requireAuth);

router.get('/customer/:customerId/code', requirePermission('marketing:read'), asyncHandler(ReferralController.getCustomerCode));
router.post('/code', requirePermission('marketing:write'), validateRequest(createReferralCodeSchema), asyncHandler(ReferralController.createCode));
router.patch('/:id/status', requirePermission('marketing:write'), validateRequest(updateReferralStatusSchema), asyncHandler(ReferralController.updateStatus));

export const referralRoutes = router;
