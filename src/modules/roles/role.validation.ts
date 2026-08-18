import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only'),
    description: z.string().optional().nullable(),
    permissionKeys: z.array(z.string()).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    description: z.string().optional().nullable(),
    // Slug update is generally restricted to prevent breaking things, but we might allow it.
    // The instructions say: "Slug change should be treated carefully. Prefer stable slugs"
    // So we'll omit it from general updates.
  }),
});

export const assignPermissionsSchema = z.object({
  body: z.object({
    permissionKeys: z.array(z.string()),
  }),
});
