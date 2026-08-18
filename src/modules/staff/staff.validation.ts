import { z } from 'zod';

export const listStaffSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    status: z.enum(['INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
    roleId: z.string().uuid().optional(),
    sort: z.enum(['createdAt', 'name', 'email', 'lastLoginAt']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const inviteStaffSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    roleIds: z.array(z.string().uuid()).min(1, 'At least one role must be assigned'),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
  }),
});

export const updateStaffStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
  }),
});

export const updateStaffRolesSchema = z.object({
  body: z.object({
    roleIds: z.array(z.string().uuid()),
  }),
});
