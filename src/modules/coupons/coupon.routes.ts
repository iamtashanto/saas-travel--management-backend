import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createCouponSchema,
  validateCouponSchema,
} from './coupon.validation';

const router = Router();

// Publicly accessible but rate limited validation endpoint (might be mounted elsewhere as well)
router.post('/validate', validateRequest(validateCouponSchema), asyncHandler(CouponController.validateCoupon));

router.use(requireAuth);

router.get('/', requirePermission('marketing:read'), asyncHandler(CouponController.listCoupons));
router.post('/', requirePermission('marketing:write'), validateRequest(createCouponSchema), asyncHandler(CouponController.createCoupon));

export const couponRoutes = router;
