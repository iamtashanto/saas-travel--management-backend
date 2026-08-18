import { Router } from 'express';
import { CorporateReportController } from './corporate-report.controller';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', requirePermission('reports.corporate'), CorporateReportController.getDashboard);
router.get('/quotations', requirePermission('reports.corporate'), CorporateReportController.getQuotationMetrics);

export const corporateReportRoutes = router;
