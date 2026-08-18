import { z } from 'zod';

export const createItineraryItemSchema = z.object({
  body: z.object({
    dayNumber: z.number().int().min(1),
    sortOrder: z.number().int().optional().default(0),
    time: z.string().optional().nullable(),
    title: z.string().min(2),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
  })
});

export const updateItineraryItemSchema = z.object({
  body: z.object({
    dayNumber: z.number().int().min(1).optional(),
    sortOrder: z.number().int().optional(),
    time: z.string().optional().nullable(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
  })
});

export const reorderItinerarySchema = z.object({
  body: z.object({
    items: z.array(z.object({
      id: z.string().uuid(),
      dayNumber: z.number().int().min(1),
      sortOrder: z.number().int()
    })).min(1)
  })
});
