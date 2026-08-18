import { z } from 'zod';
import { LoyaltyTransactionType } from '@prisma/client';

export const adjustBalanceSchema = z.object({
  params: z.object({
    accountId: z.string().uuid(),
  }),
  body: z.object({
    points: z.number(),
    type: z.nativeEnum(LoyaltyTransactionType),
    description: z.string().optional(),
    referenceType: z.string().optional(),
    referenceId: z.string().uuid().optional(),
  }),
});
