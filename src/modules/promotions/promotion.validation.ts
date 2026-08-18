import { z } from 'zod';
import { PromotionType, CategoryStatus } from '@prisma/client';

export const createPromotionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(100),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    promotionType: z.nativeEnum(PromotionType),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    status: z.nativeEnum(CategoryStatus).optional().default('ACTIVE'),
    bannerImage: z.string().url().optional(),
    landingUrl: z.string().url().optional(),
    priority: z.number().int().optional().default(0),
    isFeatured: z.boolean().optional().default(false),
  }),
});

export const updatePromotionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(CategoryStatus).optional(),
    bannerImage: z.string().url().optional(),
    landingUrl: z.string().url().optional(),
    priority: z.number().int().optional(),
    isFeatured: z.boolean().optional(),
  }),
});
