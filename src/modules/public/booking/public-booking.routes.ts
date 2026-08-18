import { Router } from 'express';
import { PublicBookingController } from './public-booking.controller';
import { validateRequest } from '../../../middlewares/validate-request';
import { publicCreateBookingSchema, publicBookingLookupSchema } from '../../bookings/booking.validation';
import { idempotencyMiddleware } from '../../idempotency/idempotency.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters for public endpoints
const publicBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 bookings per window
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many booking attempts, please try again later.' } },
});

const publicLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 lookups per window
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many lookup attempts, please try again later.' } },
});

router.post(
  '/',
  publicBookingLimiter,
  idempotencyMiddleware,
  validateRequest(publicCreateBookingSchema),
  PublicBookingController.createPublicBooking
);

router.post(
  '/lookup',
  publicLookupLimiter,
  validateRequest(publicBookingLookupSchema),
  PublicBookingController.lookupBooking
);

router.get(
  '/tour-schedules/:scheduleId/availability',
  PublicBookingController.getScheduleAvailability
);

export const publicBookingRoutes = router;
