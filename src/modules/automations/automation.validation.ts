import { z } from 'zod';

export const createRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    trigger: z.string().min(1),
    conditions: z.any().optional(),
    actions: z.any(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateRuleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    trigger: z.string().min(1).optional(),
    conditions: z.any().optional(),
    actions: z.any().optional(),
    isActive: z.boolean().optional(),
  }),
});
