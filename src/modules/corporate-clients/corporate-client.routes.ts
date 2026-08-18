import { Router } from 'express';
import { CorporateClientController, corporateClientSchema } from './corporate-client.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('corporate.view'), CorporateClientController.list);
router.post('/', requirePermission('corporate.create'), validateRequest(corporateClientSchema), CorporateClientController.create);
router.patch('/:id', requirePermission('corporate.update'), validateRequest(corporateClientSchema.partial()), CorporateClientController.update);
router.delete('/:id', requirePermission('corporate.delete'), CorporateClientController.delete);

router.get('/:id/history', requirePermission('corporate.view'), CorporateClientController.getHistory);
router.get('/:id/summary', requirePermission('corporate.view'), CorporateClientController.getSummary);

export const corporateClientRoutes = router;
