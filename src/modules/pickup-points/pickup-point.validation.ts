import { z } from 'zod';

export const listPickupPointsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    sort: z.enum(['name', 'createdAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createPickupPointSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    defaultPickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be HH:MM').optional().nullable(),
    contactName: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }).refine(data => {
    // Coordinate pairs
    if (data.latitude !== undefined && data.latitude !== null && (data.longitude === undefined || data.longitude === null)) return false;
    if (data.longitude !== undefined && data.longitude !== null && (data.latitude === undefined || data.latitude === null)) return false;
    return true;
  }, {
    message: 'Latitude and longitude must both be provided if one is provided',
    path: ['latitude']
  }),
});

export const updatePickupPointSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    defaultPickupTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    contactName: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
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
