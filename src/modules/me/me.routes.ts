import { Router } from 'express';
import * as controller from './me.controller';
import { updateStaffSchema } from '../staff/staff.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

// For 'me', we don't necessarily require a specific RBAC permission to read own profile, 
// but we could require 'profile.read' if we strictly follow the catalog.
// The instructions mentioned:
// Me/profile:
// profile.read
// profile.update

router.get('/profile', 
  requirePermission('profile.read'), 
  controller.getProfile
);

router.patch('/profile', 
  requirePermission('profile.update'), 
  validateRequest(updateStaffSchema), 
  controller.updateProfile
);

export const meRoutes = router;
