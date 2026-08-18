import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { sendResponse } from '../../utils/response';

export class BookingController {
  static async listBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.listBookings(req.tenant!.organizationId, req.query as any);
      sendResponse(res, 200, true, 'Bookings retrieved successfully', result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getBookingById(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Booking retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.createBooking(req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 201, true, 'Booking created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.updateBookingStatus(req.params.id, req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 200, true, 'Booking status updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getScheduleAvailability(req.tenant!.organizationId, req.params.scheduleId);
      sendResponse(res, 200, true, 'Availability retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
