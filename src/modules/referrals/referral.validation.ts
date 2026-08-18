import { z } from 'zod';
import { ReferralStatus } from '@prisma/client';

export const createReferralCodeSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    code: z.string().min(1).max(50),
    usageLimit: z.number().int().positive().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
  }),
});

export const updateReferralStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(ReferralStatus),
  }),
});
