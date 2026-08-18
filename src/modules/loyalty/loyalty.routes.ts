import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { adjustBalanceSchema } from './loyalty.validation';

const router = Router();

router.use(requireAuth);

router.get('/customer/:customerId', requirePermission('marketing:read'), asyncHandler(LoyaltyController.getCustomerAccount));
router.get('/account/:accountId/transactions', requirePermission('marketing:read'), asyncHandler(LoyaltyController.getTransactions));
router.post('/account/:accountId/adjust', requirePermission('marketing:write'), validateRequest(adjustBalanceSchema), asyncHandler(LoyaltyController.adjustBalance));

export const loyaltyRoutes = router;
