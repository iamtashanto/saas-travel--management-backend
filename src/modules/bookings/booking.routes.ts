import { Router } from 'express';
import { BookingController } from './booking.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { requireAuth } from '../../middlewares/require-auth';
import { requirePermission } from '../../middlewares/require-permission';
import { listBookingsSchema, createBookingSchema, updateBookingStatusSchema } from './booking.validation';

const router = Router();

router.use(requireAuth);

router.get('/', requirePermission('booking:read'), validateRequest(listBookingsSchema), BookingController.listBookings);
router.post('/', requirePermission('booking:write'), validateRequest(createBookingSchema), BookingController.createBooking);
router.get('/:id', requirePermission('booking:read'), BookingController.getBookingById);
router.patch('/:id/status', requirePermission('booking:write'), validateRequest(updateBookingStatusSchema), BookingController.updateBookingStatus);
router.get('/tour-schedules/:scheduleId/availability', requirePermission('booking:read'), BookingController.getAvailability);

export const bookingRoutes = router;
