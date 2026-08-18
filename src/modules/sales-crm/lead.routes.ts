import { Router } from 'express';
import { LeadController, leadSchema } from './lead.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('lead.view'), LeadController.list);
router.get('/pipeline', requirePermission('lead.view'), LeadController.getPipeline);
router.post('/', requirePermission('lead.create'), validateRequest(leadSchema), LeadController.create);
router.patch('/:id', requirePermission('lead.update'), validateRequest(leadSchema.partial()), LeadController.update);

export const leadRoutes = router;
