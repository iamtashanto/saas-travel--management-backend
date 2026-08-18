import { Router } from 'express';
import { AutomationController } from './automation.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createRuleSchema,
  updateRuleSchema,
} from './automation.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('marketing:read'), asyncHandler(AutomationController.listRules));
router.post('/', requirePermission('marketing:write'), validateRequest(createRuleSchema), asyncHandler(AutomationController.createRule));
router.get('/:id', requirePermission('marketing:read'), asyncHandler(AutomationController.getRuleById));
router.patch('/:id', requirePermission('marketing:write'), validateRequest(updateRuleSchema), asyncHandler(AutomationController.updateRule));

export const automationRoutes = router;
