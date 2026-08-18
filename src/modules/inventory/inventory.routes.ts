import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { inventoryLocationSchema, inventoryItemSchema, stockMovementSchema } from './inventory.validation';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';

const router = Router();

router.use(requireAuth);

// Locations
router.get('/locations', requirePermission('inventory.view'), InventoryController.listLocations);
router.post('/locations', requirePermission('inventory.manage'), validateRequest(inventoryLocationSchema), InventoryController.createLocation);

// Items
router.get('/items', requirePermission('inventory.view'), InventoryController.listItems);
router.get('/items/:id', requirePermission('inventory.view'), InventoryController.getItem);
router.post('/items', requirePermission('inventory.manage'), validateRequest(inventoryItemSchema), InventoryController.createItem);

// Movements
router.post('/movements', requirePermission('inventory.manage'), validateRequest(stockMovementSchema), InventoryController.recordMovement);

export const inventoryRoutes = router;
