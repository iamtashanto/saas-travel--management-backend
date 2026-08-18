import { z } from 'zod';

export const listSchedulesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    status: z.enum(['DRAFT', 'OPEN', 'FULL', 'CLOSED', 'CANCELLED', 'COMPLETED']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sort: z.enum(['startDate', 'createdAt']).optional().default('startDate'),
    order: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const createScheduleSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
    departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    returnTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    departureLocation: z.string().optional().nullable(),
    returnLocation: z.string().optional().nullable(),
    capacity: z.number().int().min(1),
    minimumRequiredTravelers: z.number().int().min(1).optional().nullable(),
    basePriceOverride: z.number().min(0).optional().nullable(),
    adultPrice: z.number().min(0).optional().nullable(),
    childPrice: z.number().min(0).optional().nullable(),
    infantPrice: z.number().min(0).optional().nullable(),
    bookingOpenAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional().nullable(),
    bookingCloseAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional().nullable(),
    status: z.enum(['DRAFT', 'OPEN']).optional().default('DRAFT'),
  }).refine(data => {
    if (new Date(data.startDate) > new Date(data.endDate)) return false;
    return true;
  }, {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate']
  }).refine(data => {
    if (data.bookingOpenAt && data.bookingCloseAt) {
      if (new Date(data.bookingOpenAt) >= new Date(data.bookingCloseAt)) return false;
    }
    return true;
  }, {
    message: 'bookingOpenAt must be before bookingCloseAt',
    path: ['bookingOpenAt']
  }),
});

export const updateScheduleSchema = z.object({
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional(),
    departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    returnTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    departureLocation: z.string().optional().nullable(),
    returnLocation: z.string().optional().nullable(),
    capacity: z.number().int().min(1).optional(),
    minimumRequiredTravelers: z.number().int().min(1).optional().nullable(),
    basePriceOverride: z.number().min(0).optional().nullable(),
    adultPrice: z.number().min(0).optional().nullable(),
    childPrice: z.number().min(0).optional().nullable(),
    infantPrice: z.number().min(0).optional().nullable(),
    bookingOpenAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional().nullable(),
    bookingCloseAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/).optional().nullable(),
    status: z.enum(['DRAFT', 'OPEN', 'FULL', 'CLOSED', 'CANCELLED', 'COMPLETED']).optional(),
  }), // Note: The cross-field validations require previous state if partial, handled in service.
});

export const bulkCreateSchedulesSchema = z.object({
  body: z.object({
    schedules: z.array(z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      capacity: z.number().int().min(1),
    }).refine(data => {
      if (new Date(data.startDate) > new Date(data.endDate)) return false;
      return true;
    }, {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate']
    })).min(1).max(50)
  }),
});
