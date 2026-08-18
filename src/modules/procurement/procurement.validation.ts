import { z } from 'zod';

export const purchaseRequestSchema = z.object({
  department: z.string().optional(),
  requiredDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  reason: z.string().optional(),
  items: z.array(
    z.object({
      item: z.string().min(1),
      description: z.string().optional(),
      quantity: z.number().positive(),
      estimatedUnitCost: z.number().positive().optional(),
      tourScheduleId: z.string().uuid().optional(),
      category: z.string().optional(),
    })
  ).min(1)
});

export const purchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  orderDate: z.string().datetime(),
  expectedDate: z.string().datetime().optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      tax: z.number().min(0).optional(),
      discount: z.number().min(0).optional(),
      inventoryItemId: z.string().uuid().optional(),
      tourScheduleId: z.string().uuid().optional(),
    })
  ).min(1)
});

export const goodsReceiptSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      orderedQty: z.number().positive(),
      receivedQty: z.number().min(0).optional(),
      rejectedQty: z.number().min(0).optional(),
      acceptedQty: z.number().min(0).optional(),
    })
  ).min(1)
});
