import { Router } from 'express';
import { QuotationController, quotationSchema } from './quotation.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('quotation.view'), QuotationController.list);
router.get('/:id', requirePermission('quotation.view'), QuotationController.get);
router.post('/', requirePermission('quotation.create'), validateRequest(quotationSchema), QuotationController.create);

router.post('/:id/revisions', requirePermission('quotation.update'), validateRequest(quotationSchema), QuotationController.revise);

router.post('/:id/send', requirePermission('quotation.send'), QuotationController.send);
router.post('/:id/accept', requirePermission('quotation.accept'), QuotationController.accept);
router.post('/:id/reject', requirePermission('quotation.reject'), QuotationController.reject);

router.post('/:id/convert-to-booking', requirePermission('quotation.accept'), QuotationController.convertToBooking);

export const quotationRoutes = router;
