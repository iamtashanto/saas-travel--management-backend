import { Router } from 'express';
import * as controller from './pickup-point.controller';
import * as validation from './pickup-point.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('pickupPoint.read'), 
  validateRequest(validation.listPickupPointsSchema), 
  controller.listPickupPoints
);

router.get('/:id', 
  requirePermission('pickupPoint.read'), 
  controller.getPickupPoint
);

router.post('/', 
  requirePermission('pickupPoint.create'), 
  validateRequest(validation.createPickupPointSchema), 
  controller.createPickupPoint
);

router.patch('/:id', 
  requirePermission('pickupPoint.update'), 
  validateRequest(validation.updatePickupPointSchema), 
  controller.updatePickupPoint
);

router.delete('/:id', 
  requirePermission('pickupPoint.delete'), 
  controller.deletePickupPoint
);

export const pickupPointRoutes = router;
