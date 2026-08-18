import { Router } from 'express';
import { ProposalController, proposalSchema } from './proposal.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('proposal.view'), ProposalController.list);
router.post('/', requirePermission('proposal.create'), validateRequest(proposalSchema), ProposalController.create);
router.patch('/:id', requirePermission('proposal.update'), validateRequest(proposalSchema.partial()), ProposalController.update);
router.post('/:id/send', requirePermission('proposal.send'), ProposalController.send);

export const proposalRoutes = router;
