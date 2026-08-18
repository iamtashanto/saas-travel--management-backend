import { Router } from 'express';
import * as controller from './destination.controller';
import * as validation from './destination.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('destination.read'), 
  validateRequest(validation.listDestinationsSchema), 
  controller.listDestinations
);

router.get('/:id', 
  requirePermission('destination.read'), 
  controller.getDestination
);

router.post('/', 
  requirePermission('destination.create'), 
  validateRequest(validation.createDestinationSchema), 
  controller.createDestination
);

router.patch('/:id', 
  requirePermission('destination.update'), 
  validateRequest(validation.updateDestinationSchema), 
  controller.updateDestination
);

router.delete('/:id', 
  requirePermission('destination.delete'), 
  controller.deleteDestination
);

export const destinationRoutes = router;
