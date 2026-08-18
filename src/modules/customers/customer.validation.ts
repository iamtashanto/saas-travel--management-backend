import { z } from 'zod';

export const listCustomersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    createdFrom: z.string().datetime().optional(),
    createdTo: z.string().datetime().optional(),
    sort: z.enum(['createdAt', 'displayName', 'totalSpent']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(5).optional().nullable(),
    whatsappPhone: z.string().min(5).optional().nullable(),
    countryCode: z.string().length(2).optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(5).optional().nullable(),
    whatsappPhone: z.string().min(5).optional().nullable(),
    countryCode: z.string().length(2).optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  }),
});

export const mergeCustomerSchema = z.object({
  body: z.object({
    targetCustomerId: z.string().uuid(),
  }),
});
