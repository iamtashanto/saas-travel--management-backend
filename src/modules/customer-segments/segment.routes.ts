import { Router } from 'express';
import { SegmentController } from './segment.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { asyncHandler } from '../../common/utils/asyncHandler';
import {
  createSegmentSchema,
  updateSegmentSchema,
  addSegmentMembersSchema,
  removeSegmentMembersSchema,
} from './segment.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('marketing:read'), asyncHandler(SegmentController.listSegments));
router.post('/', requirePermission('marketing:write'), validateRequest(createSegmentSchema), asyncHandler(SegmentController.createSegment));
router.get('/:id', requirePermission('marketing:read'), asyncHandler(SegmentController.getSegmentById));
router.patch('/:id', requirePermission('marketing:write'), validateRequest(updateSegmentSchema), asyncHandler(SegmentController.updateSegment));
router.post('/:id/members', requirePermission('marketing:write'), validateRequest(addSegmentMembersSchema), asyncHandler(SegmentController.addMembers));
router.delete('/:id/members', requirePermission('marketing:write'), validateRequest(removeSegmentMembersSchema), asyncHandler(SegmentController.removeMembers));

export const segmentRoutes = router;
