import { z } from 'zod';
import { CampaignType, CampaignStatus } from '@prisma/client';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    code: z.string().min(1, 'Code is required').max(50),
    description: z.string().optional(),
    type: z.nativeEnum(CampaignType),
    audienceType: z.string().min(1),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    status: z.nativeEnum(CampaignStatus).optional().default('DRAFT'),
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid campaign ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    status: z.nativeEnum(CampaignStatus).optional(),
  }),
});

export const addRecipientsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid campaign ID'),
  }),
  body: z.object({
    customerIds: z.array(z.string().uuid('Invalid customer ID')).min(1),
    channel: z.string().min(1),
  }),
});
