import { Router } from 'express';
import * as controller from './category.controller';
import * as validation from './category.validation';
import { validateRequest } from '../../common/middleware/validateRequest';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireActiveOrganization } from '../../common/middleware/organization.middleware';
import { requirePermission } from '../../common/middleware/permission.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.get('/', 
  requirePermission('tourCategory.read'), 
  validateRequest(validation.listCategoriesSchema), 
  controller.listCategories
);

router.get('/:id', 
  requirePermission('tourCategory.read'), 
  controller.getCategory
);

router.post('/', 
  requirePermission('tourCategory.create'), 
  validateRequest(validation.createCategorySchema), 
  controller.createCategory
);

router.patch('/:id', 
  requirePermission('tourCategory.update'), 
  validateRequest(validation.updateCategorySchema), 
  controller.updateCategory
);

router.delete('/:id', 
  requirePermission('tourCategory.delete'), 
  controller.deleteCategory
);

export const tourCategoryRoutes = router;
