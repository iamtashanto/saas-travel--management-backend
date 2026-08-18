import { z } from 'zod';

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    sort: z.enum(['name', 'sortOrder', 'createdAt']).optional().default('sortOrder'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only').optional(),
    description: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    imageUrl: z.string().url('Invalid URL').optional().nullable(),
    sortOrder: z.number().int().optional().default(0),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    sortOrder: z.number().int().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  }),
});
