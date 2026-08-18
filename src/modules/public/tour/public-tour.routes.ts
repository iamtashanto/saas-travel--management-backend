import { Router } from 'express';
import * as controller from './public-tour.controller';
import { resolvePublicTenant } from '../../../common/middleware/public-tenant.middleware';

const router = Router();

router.use(resolvePublicTenant);

router.get('/tours', controller.listPublicTours);
router.get('/tours/:slug', controller.getPublicTour);

export const publicRoutes = router;
