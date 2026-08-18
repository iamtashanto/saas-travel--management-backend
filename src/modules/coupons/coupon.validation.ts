import { z } from 'zod';
import { CouponDiscountType } from '@prisma/client';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    discountType: z.nativeEnum(CouponDiscountType),
    discountValue: z.number().positive(),
    maxDiscount: z.number().positive().optional(),
    minimumOrderValue: z.number().min(0).optional(),
    maximumOrderValue: z.number().min(0).optional(),
    usageLimit: z.number().int().positive().optional(),
    usagePerCustomer: z.number().int().positive().optional().default(1),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    isActive: z.boolean().optional().default(true),
    stackable: z.boolean().optional().default(false),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    endAt: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    customerId: z.string().uuid(),
    orderValue: z.number().min(0),
  }),
});
