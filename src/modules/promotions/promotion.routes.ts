import { Router } from 'express';
import { PromotionController } from './promotion.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createPromotionSchema,
  updatePromotionSchema,
} from './promotion.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('marketing:read'), asyncHandler(PromotionController.listPromotions));
router.post('/', requirePermission('marketing:write'), validateRequest(createPromotionSchema), asyncHandler(PromotionController.createPromotion));
router.patch('/:id', requirePermission('marketing:write'), validateRequest(updatePromotionSchema), asyncHandler(PromotionController.updatePromotion));

export const promotionRoutes = router;
