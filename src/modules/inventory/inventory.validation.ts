import { z } from 'zod';

export const inventoryLocationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['MAIN_WAREHOUSE', 'OFFICE', 'VEHICLE', 'TOUR_KIT', 'BRANCH']),
  isActive: z.boolean().optional(),
});

export const inventoryItemSchema = z.object({
  itemCode: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.enum(['PCS', 'BOX', 'KG', 'LITERS', 'OTHER']),
  description: z.string().optional(),
  minimumStock: z.number().min(0).optional(),
  maximumStock: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  costMethod: z.enum(['AVERAGE_COST', 'FIFO']).optional(),
  isActive: z.boolean().optional(),
});

export const stockMovementSchema = z.object({
  inventoryItemId: z.string().uuid(),
  fromLocationId: z.string().uuid().optional(),
  toLocationId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  type: z.enum(['PURCHASE', 'RECEIVE', 'ISSUE', 'TRANSFER', 'RETURN', 'ADJUSTMENT', 'WASTE', 'DAMAGE']),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
});
