import { Router } from 'express';
import * as controller from './permission.controller';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('permission.read'), 
  controller.getPermissions
);

export const permissionRoutes = router;
