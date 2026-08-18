import { Router } from 'express';
import * as controller from './organization.controller';
import * as validation from './organization.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

// Apply base tenant security to all organization routes
router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('organization.read'), 
  controller.getOrganization
);

router.patch('/', 
  requirePermission('organization.update'), 
  validateRequest(validation.updateOrganizationSchema), 
  controller.updateOrganization
);

router.get('/settings', 
  requirePermission('organization.settings.read'), 
  controller.getSettings
);

router.patch('/settings', 
  requirePermission('organization.settings.update'), 
  validateRequest(validation.updateOrganizationSettingsSchema), 
  controller.updateSettings
);

router.get('/stats', 
  requirePermission('organization.read'), 
  controller.getStats
);

router.get('/security', 
  requirePermission('security.read'), 
  controller.getSecurity
);

export const organizationRoutes = router;
