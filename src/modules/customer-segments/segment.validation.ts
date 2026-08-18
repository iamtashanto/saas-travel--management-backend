import { z } from 'zod';
import { SegmentType } from '@prisma/client';

export const createSegmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    code: z.string().min(1, 'Code is required').max(50),
    description: z.string().optional(),
    type: z.nativeEnum(SegmentType).default('MANUAL'),
    rules: z.any().optional(), // In production, this would validate specific AST JSON structures
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateSegmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid segment ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    rules: z.any().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const addSegmentMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid segment ID'),
  }),
  body: z.object({
    customerIds: z.array(z.string().uuid('Invalid customer ID')).min(1, 'At least one customer is required'),
  }),
});

export const removeSegmentMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid segment ID'),
  }),
  body: z.object({
    customerIds: z.array(z.string().uuid('Invalid customer ID')).min(1, 'At least one customer is required'),
  }),
});
