import { Router } from 'express';
import { CampaignController } from './campaign.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createCampaignSchema,
  updateCampaignSchema,
  addRecipientsSchema,
} from './campaign.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('marketing:read'), asyncHandler(CampaignController.listCampaigns));
router.post('/', requirePermission('marketing:write'), validateRequest(createCampaignSchema), asyncHandler(CampaignController.createCampaign));
router.get('/:id', requirePermission('marketing:read'), asyncHandler(CampaignController.getCampaignById));
router.patch('/:id', requirePermission('marketing:write'), validateRequest(updateCampaignSchema), asyncHandler(CampaignController.updateCampaign));
router.post('/:id/recipients', requirePermission('marketing:write'), validateRequest(addRecipientsSchema), asyncHandler(CampaignController.addRecipients));

export const campaignRoutes = router;
