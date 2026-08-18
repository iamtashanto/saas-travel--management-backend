import { Router } from 'express';
import { ProcurementController } from './procurement.controller';
import { purchaseRequestSchema, purchaseOrderSchema, goodsReceiptSchema } from './procurement.validation';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

// Purchase Requests
router.get('/purchase-requests', requirePermission('procurement.view'), ProcurementController.listPRs);
router.get('/purchase-requests/:id', requirePermission('procurement.view'), ProcurementController.getPR);
router.post('/purchase-requests', requirePermission('procurement.manage'), validateRequest(purchaseRequestSchema), ProcurementController.createPR);
router.patch('/purchase-requests/:id/status', requirePermission('procurement.manage'), ProcurementController.updatePRStatus);

// Purchase Orders
router.get('/purchase-orders', requirePermission('procurement.view'), ProcurementController.listPOs);
router.get('/purchase-orders/:id', requirePermission('procurement.view'), ProcurementController.getPO);
router.post('/purchase-orders', requirePermission('procurement.manage'), validateRequest(purchaseOrderSchema), ProcurementController.createPO);

// Goods Receipts
router.get('/goods-receipts/:id', requirePermission('procurement.view'), ProcurementController.getGR);
router.post('/goods-receipts', requirePermission('procurement.manage'), validateRequest(goodsReceiptSchema), ProcurementController.createGR);

export const procurementRoutes = router;
