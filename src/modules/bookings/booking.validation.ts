import { z } from 'zod';

export const listBookingsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    customerId: z.string().uuid().optional(),
    tourScheduleId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'HELD', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'NO_SHOW']).optional(),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    tourPackageId: z.string().uuid(),
    tourScheduleId: z.string().uuid(),
    bookingSource: z.enum(['WEBSITE', 'ADMIN', 'PHONE', 'WHATSAPP', 'FACEBOOK', 'OFFICE', 'REFERRAL', 'OTHER']).optional(),
    travelers: z.array(z.object({
      travelerId: z.string().uuid(),
      type: z.enum(['ADULT', 'CHILD', 'INFANT']),
      pickupPointId: z.string().uuid().optional(),
      specialRequirement: z.string().optional(),
    })).min(1),
    addons: z.array(z.object({
      tourAddonId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })).optional(),
    specialRequest: z.string().optional(),
    internalNote: z.string().optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
    reason: z.string().optional(),
  }),
});

export const publicCreateBookingSchema = z.object({
  body: z.object({
    tourPackageId: z.string().uuid(),
    tourScheduleId: z.string().uuid(),
    customer: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(5),
    }),
    travelers: z.array(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      type: z.enum(['ADULT', 'CHILD', 'INFANT']),
      pickupPointId: z.string().uuid().optional(),
    })).min(1),
    addons: z.array(z.object({
      tourAddonId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })).optional(),
    specialRequest: z.string().optional(),
  }),
});

export const publicBookingLookupSchema = z.object({
  body: z.object({
    bookingReference: z.string().min(1),
    phone: z.string().min(5),
  }),
});
