import { z } from 'zod';

export const createAddonSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    price: z.number().min(0),
    currency: z.string().length(3).optional().default('BDT'),
    capacity: z.number().int().min(1).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
    sortOrder: z.number().int().optional().default(0),
  })
});

export const updateAddonSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    price: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    capacity: z.number().int().min(1).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    sortOrder: z.number().int().optional(),
  })
});
