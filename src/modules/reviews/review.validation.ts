import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

export const createReviewSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    bookingId: z.string().uuid(),
    tourPackageId: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const updateReviewStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.nativeEnum(ReviewStatus),
  }),
});
