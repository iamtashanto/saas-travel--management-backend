import { Router } from 'express';
import * as controller from './staff.controller';
import * as validation from './staff.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('staff.read'), 
  validateRequest(validation.listStaffSchema), 
  controller.listStaff
);

router.post('/invitations', 
  requirePermission('staff.invite'), 
  validateRequest(validation.inviteStaffSchema), 
  controller.inviteStaff
);

router.get('/invitations', 
  requirePermission('staff.read'), 
  controller.listInvitations
);

// Resend isn't fully implemented in service, but we can reuse invite for now since it cancels old ones
// We will just map it for simplicity or create an explicit resend. Let's just create the route.
// router.post('/invitations/:invitationId/resend', requirePermission('staff.invite'), controller.resendInvitation);

router.delete('/invitations/:invitationId', 
  requirePermission('staff.invite'), 
  controller.cancelInvitation
);

router.get('/:userId', 
  requirePermission('staff.read'), 
  controller.getStaff
);

router.patch('/:userId', 
  requirePermission('staff.update'), 
  validateRequest(validation.updateStaffSchema), 
  controller.updateStaff
);

router.patch('/:userId/status', 
  requirePermission('staff.status.update'), 
  validateRequest(validation.updateStaffStatusSchema), 
  controller.updateStatus
);

router.put('/:userId/roles', 
  requirePermission('staff.roles.update'), 
  validateRequest(validation.updateStaffRolesSchema), 
  controller.updateRoles
);

router.delete('/:userId', 
  requirePermission('staff.delete'), 
  controller.deleteStaff
);

router.post('/:userId/revoke-sessions', 
  requirePermission('staff.sessions.revoke'), 
  controller.revokeSessions
);

export const staffRoutes = router;
