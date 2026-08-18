import { Router } from 'express';
import * as controller from './role.controller';
import * as validation from './role.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('role.read'), 
  controller.getRoles
);

router.get('/:roleId', 
  requirePermission('role.read'), 
  controller.getRole
);

router.post('/', 
  requirePermission('role.create'), 
  validateRequest(validation.createRoleSchema), 
  controller.createRole
);

router.patch('/:roleId', 
  requirePermission('role.update'), 
  validateRequest(validation.updateRoleSchema), 
  controller.updateRole
);

router.delete('/:roleId', 
  requirePermission('role.delete'), 
  controller.deleteRole
);

router.put('/:roleId/permissions', 
  requirePermission('role.permissions.update'), 
  validateRequest(validation.assignPermissionsSchema), 
  controller.updatePermissions
);

export const roleRoutes = router;
