import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { listCustomersSchema, createCustomerSchema, updateCustomerSchema, mergeCustomerSchema } from './customer.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('customer:read'), validateRequest(listCustomersSchema), CustomerController.listCustomers);
router.post('/', requirePermission('customer:write'), validateRequest(createCustomerSchema), CustomerController.createCustomer);
router.get('/:id', requirePermission('customer:read'), CustomerController.getCustomerById);
router.patch('/:id', requirePermission('customer:write'), validateRequest(updateCustomerSchema), CustomerController.updateCustomer);
router.post('/:id/merge', requirePermission('customer:delete'), validateRequest(mergeCustomerSchema), CustomerController.mergeCustomers);

export const customerRoutes = router;
