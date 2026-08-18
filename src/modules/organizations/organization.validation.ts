import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    legalName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(), // basic format allowed, further validation can be added
    website: z.string().url('Invalid URL').optional().nullable(),
    logoUrl: z.string().url('Invalid URL').optional().nullable(),
    defaultCurrency: z.string().length(3, 'Currency must be 3-letter ISO code').regex(/^[A-Z]{3}$/, 'Must be uppercase letters').optional(),
    timezone: z.string().min(1, 'Timezone is required').optional(), // Basic check, service layer or custom refinement can validate IANA
    countryCode: z.string().length(2, 'Country code must be 2-letter ISO code').regex(/^[A-Z]{2}$/, 'Must be uppercase letters').optional(),
  }),
});

export const updateOrganizationSettingsSchema = z.object({
  body: z.object({
    dateFormat: z.string().min(1).optional(),
    timeFormat: z.string().min(1).optional(),
    weekStartsOn: z.number().int().min(0).max(6).optional(),
    language: z.string().min(2).optional(),
    bookingPrefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, 'Invalid prefix format').optional(),
    invoicePrefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, 'Invalid prefix format').optional(),
    quotationPrefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, 'Invalid prefix format').optional(),
    customerPrefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, 'Invalid prefix format').optional(),
    defaultBookingStatus: z.string().min(1).optional(),
    allowOnlineBooking: z.boolean().optional(),
    showPublicSeatAvailability: z.boolean().optional(),
    lowSeatThreshold: z.number().int().min(0).optional(),
    defaultCancellationPolicy: z.string().optional().nullable(),
  }),
});
