import { Router } from 'express';
import { ContractController, contractSchema } from './contract.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('contract.view'), ContractController.list);
router.post('/', requirePermission('contract.create'), validateRequest(contractSchema), ContractController.create);
router.patch('/:id', requirePermission('contract.update'), validateRequest(contractSchema.partial()), ContractController.update);

router.post('/:id/sign', requirePermission('contract.sign'), ContractController.sign);
router.post('/:id/terminate', requirePermission('contract.terminate'), ContractController.terminate);

export const contractRoutes = router;
