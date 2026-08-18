import { z } from 'zod';

export const listToursSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    destinationId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED']).optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
    duration: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'sortOrder', 'basePrice']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createTourSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only').optional(),
    shortDescription: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    destinationId: z.string().uuid(),
    categoryId: z.string().uuid(),
    coverImageUrl: z.string().url().optional().nullable(),
    durationDays: z.number().int().min(1),
    durationNights: z.number().int().min(0),
    basePrice: z.number().min(0),
    childPrice: z.number().min(0).optional().nullable(),
    infantPrice: z.number().min(0).optional().nullable(),
    currency: z.string().length(3).optional().default('BDT'),
    internalNotes: z.string().optional().nullable(),
    sortOrder: z.number().int().optional().default(0),
  }),
});

export const updateTourSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    shortDescription: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    destinationId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    coverImageUrl: z.string().url().optional().nullable(),
    durationDays: z.number().int().min(1).optional(),
    durationNights: z.number().int().min(0).optional(),
    basePrice: z.number().min(0).optional(),
    childPrice: z.number().min(0).optional().nullable(),
    infantPrice: z.number().min(0).optional().nullable(),
    currency: z.string().length(3).optional(),
    internalNotes: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
});
