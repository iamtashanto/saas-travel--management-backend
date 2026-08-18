import { z } from 'zod';

export const listTravelersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    customerId: z.string().uuid().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }),
});

export const createTravelerSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    specialRequirements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateTravelerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    specialRequirements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});
