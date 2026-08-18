import { Router } from 'express';
import { CorporateContactController, corporateContactSchema } from './corporate-contact.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/:clientId/contacts', requirePermission('corporate.view'), CorporateContactController.list);
router.post('/:clientId/contacts', requirePermission('corporate.manage'), validateRequest(corporateContactSchema), CorporateContactController.create);
router.patch('/:clientId/contacts/:contactId', requirePermission('corporate.manage'), validateRequest(corporateContactSchema.partial()), CorporateContactController.update);
router.delete('/:clientId/contacts/:contactId', requirePermission('corporate.manage'), CorporateContactController.delete);

export const corporateContactRoutes = router;
