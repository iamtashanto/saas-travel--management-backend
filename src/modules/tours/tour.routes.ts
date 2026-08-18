import { Router } from 'express';
import * as controller from './tour.controller';
import * as validation from './tour.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

import { tourScheduleRoutes } from './tour-schedule.routes';
import { tourItineraryRoutes } from './tour-itinerary';
import { tourAddonsRoutes } from './tour-addons';
import { tourMediaRoutes } from './tour-media';
import { tourSEORoutes, tourBookingRulesRoutes, tourCancellationPolicyRoutes } from './tour-settings';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.use('/:tourId/schedules', tourScheduleRoutes);
router.use('/:tourId/itinerary', tourItineraryRoutes);
router.use('/:tourId/addons', tourAddonsRoutes);
router.use('/:tourId/media', tourMediaRoutes);
router.use('/:tourId/seo', tourSEORoutes);
router.use('/:tourId/booking-rules', tourBookingRulesRoutes);
router.use('/:tourId/cancellation-policy', tourCancellationPolicyRoutes);

router.get('/', 
  requirePermission('tour.read'), 
  validateRequest(validation.listToursSchema), 
  controller.listTours
);

router.get('/:id', 
  requirePermission('tour.read'), 
  controller.getTour
);

router.post('/', 
  requirePermission('tour.create'), 
  validateRequest(validation.createTourSchema), 
  controller.createTour
);

router.patch('/:id', 
  requirePermission('tour.update'), 
  validateRequest(validation.updateTourSchema), 
  controller.updateTour
);

router.delete('/:id', 
  requirePermission('tour.delete'), 
  controller.deleteTour
);

// Lifecycle actions
router.post('/:id/publish', 
  requirePermission('tour.publish'), 
  controller.publishTour
);

router.post('/:id/unpublish', 
  requirePermission('tour.publish'), 
  controller.unpublishTour
);

router.post('/:id/archive', 
  requirePermission('tour.archive'), 
  controller.archiveTour
);

export const tourRoutes = router;
