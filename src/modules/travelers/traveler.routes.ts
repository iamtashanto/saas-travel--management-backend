import { Router } from 'express';
import { TravelerController } from './traveler.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { listTravelersSchema, createTravelerSchema, updateTravelerSchema } from './traveler.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('traveler:read'), validateRequest(listTravelersSchema), TravelerController.listTravelers);
router.post('/', requirePermission('traveler:write'), validateRequest(createTravelerSchema), TravelerController.createTraveler);
router.get('/:id', requirePermission('traveler:read'), TravelerController.getTravelerById);
router.patch('/:id', requirePermission('traveler:write'), validateRequest(updateTravelerSchema), TravelerController.updateTraveler);
router.delete('/:id', requirePermission('traveler:delete'), TravelerController.deleteTraveler);

export const travelerRoutes = router;
