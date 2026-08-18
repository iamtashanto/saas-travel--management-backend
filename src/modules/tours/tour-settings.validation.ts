import { z } from 'zod';

export const putSEOSchema = z.object({
  body: z.object({
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
    canonicalUrl: z.string().url().optional().nullable(),
    ogTitle: z.string().max(60).optional().nullable(),
    ogDescription: z.string().max(160).optional().nullable(),
    ogImageUrl: z.string().url().optional().nullable(),
    indexable: z.boolean().optional().default(true),
  })
});

export const putBookingRulesSchema = z.object({
  body: z.object({
    minimumTravelers: z.number().int().min(1).optional().nullable(),
    maximumTravelers: z.number().int().min(1).optional().nullable(),
    bookingOpenBeforeDays: z.number().int().min(0).optional().nullable(),
    bookingCloseBeforeHours: z.number().int().min(0).optional().nullable(),
    allowChildren: z.boolean().optional().default(true),
    allowInfants: z.boolean().optional().default(true),
    allowOnlineBooking: z.boolean().optional().default(true),
    showPublicAvailability: z.boolean().optional().default(true),
    requireTravelerPhone: z.boolean().optional().default(true),
    requireEmergencyContact: z.boolean().optional().default(false),
  })
});

export const putCancellationPolicySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    allowCancellation: z.boolean().optional().default(false),
    fullRefundBeforeHours: z.number().int().min(0).optional().nullable(),
    partialRefundBeforeHours: z.number().int().min(0).optional().nullable(),
    partialRefundPercentage: z.number().min(0).max(100).optional().nullable(),
    nonRefundableAfterHours: z.number().int().min(0).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }).refine(data => {
    if (data.fullRefundBeforeHours !== null && data.partialRefundBeforeHours !== null) {
      if (data.fullRefundBeforeHours! < data.partialRefundBeforeHours!) return false;
    }
    return true;
  }, {
    message: 'fullRefundBeforeHours must be >= partialRefundBeforeHours',
    path: ['fullRefundBeforeHours']
  })
});
