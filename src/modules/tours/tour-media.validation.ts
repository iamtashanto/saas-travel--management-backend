import { z } from 'zod';

export const createMediaSchema = z.object({
  body: z.object({
    mediaType: z.enum(['IMAGE', 'VIDEO']),
    url: z.string().url(),
    altText: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    sortOrder: z.number().int().optional().default(0),
    isPrimary: z.boolean().optional().default(false),
  })
});

export const updateMediaSchema = z.object({
  body: z.object({
    altText: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    sortOrder: z.number().int().optional(),
    isPrimary: z.boolean().optional(),
  })
});

export const reorderMediaSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int()
    })).min(1)
  })
});
