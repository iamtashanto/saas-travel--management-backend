import { Router } from 'express';
import { TourManifestController } from './tour-manifest.controller';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.post('/schedules/:scheduleId', requirePermission('tour.operations.manage'), TourManifestController.generateManifest);
router.get('/schedules/:scheduleId/versions', requirePermission('tour.operations.view'), TourManifestController.listVersions);
router.get('/:id', requirePermission('tour.operations.view'), TourManifestController.getManifest);
router.post('/:id/finalize', requirePermission('tour.operations.manage'), TourManifestController.finalizeManifest);

export const tourManifestRoutes = router;
