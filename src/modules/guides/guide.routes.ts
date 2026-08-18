import { Router } from 'express';
import { GuideController, guideSchema } from './guide.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('tour.guides.view'), GuideController.list);
router.post('/', requirePermission('tour.guides.manage'), validateRequest(guideSchema), GuideController.create);
router.patch('/:id', requirePermission('tour.guides.manage'), validateRequest(guideSchema.partial()), GuideController.update);
router.delete('/:id', requirePermission('tour.guides.manage'), GuideController.delete);

export const guideRoutes = router;
