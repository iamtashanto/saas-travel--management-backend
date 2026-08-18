import { z } from 'zod';

export const listDestinationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    country: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    sort: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only').optional(),
    shortDescription: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    country: z.string().min(2).optional().nullable(),
    division: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    locationName: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    coverImageUrl: z.string().url('Invalid URL').optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional().default('DRAFT'),
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
  }).refine(data => {
    // Coordinate pairs must be together
    if ((data.latitude !== undefined && data.latitude !== null) && (data.longitude === undefined || data.longitude === null)) {
      return false;
    }
    if ((data.longitude !== undefined && data.longitude !== null) && (data.latitude === undefined || data.latitude === null)) {
      return false;
    }
    return true;
  }, {
    message: 'Latitude and longitude must both be provided if one is provided',
    path: ['latitude']
  }),
});

export const updateDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    shortDescription: z.string().max(255).optional().nullable(),
    description: z.string().optional().nullable(),
    country: z.string().min(2).optional().nullable(),
    division: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    locationName: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    coverImageUrl: z.string().url().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
  }).refine(data => {
    // Coordinate pairs
    if (data.latitude !== undefined && data.longitude === undefined) return false;
    if (data.longitude !== undefined && data.latitude === undefined) return false;
    return true;
  }, {
    message: 'Latitude and longitude must both be provided if updating coordinates',
    path: ['latitude']
  }),
});
