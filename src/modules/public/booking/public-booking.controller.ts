import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../../bookings/booking.service';
import { CustomerService } from '../../customers/customer.service';
import { TravelerService } from '../../travelers/traveler.service';
import { sendResponse } from '../../../utils/response';
import { PublicCreateBookingInput, PublicBookingLookupInput } from '../../bookings/booking.types';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../utils/app-error';
import { BookingRepository } from '../../bookings/booking.repository';

export class PublicBookingController {
  static async createPublicBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data: PublicCreateBookingInput = req.body;

      let customerId = '';
      
      await prisma.$transaction(async (tx) => {
        // 1. Upsert Customer (Create or get existing by phone)
        const normalizedPhone = data.customer.phone.replace(/\D/g, '');
        let customer = await tx.customer.findFirst({
          where: { organizationId, normalizedPhone },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              organizationId,
              firstName: data.customer.firstName,
              lastName: data.customer.lastName,
              displayName: `${data.customer.firstName} ${data.customer.lastName}`,
              email: data.customer.email,
              phone: data.customer.phone,
              normalizedPhone,
            },
          });
        }
        customerId = customer.id;

        // 2. Create Travelers
        const mappedTravelers = [];
        for (const t of data.travelers) {
          const traveler = await tx.traveler.create({
            data: {
              organizationId,
              customerId,
              firstName: t.firstName,
              lastName: t.lastName,
              displayName: `${t.firstName} ${t.lastName}`,
              email: t.email,
              phone: t.phone,
            },
          });
          mappedTravelers.push({
            travelerId: traveler.id,
            type: t.type,
            pickupPointId: t.pickupPointId,
          });
        }

        // 3. Delegate to BookingService
        const result = await BookingService.createBooking(organizationId, {
          customerId,
          tourPackageId: data.tourPackageId,
          tourScheduleId: data.tourScheduleId,
          bookingSource: 'WEBSITE',
          travelers: mappedTravelers,
          addons: data.addons,
          specialRequest: data.specialRequest,
        });

        sendResponse(res, 201, true, 'Booking created successfully', result);
      }, { timeout: 15000 }); // High timeout to accommodate capacity checks
    } catch (error) {
      next(error);
    }
  }

  static async lookupBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingReference, phone } = req.body as PublicBookingLookupInput;
      const organizationId = req.tenant!.organizationId;

      const booking = await BookingRepository.findBookingByReference(bookingReference, organizationId);
      if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

      // Verify phone number (simple auth for public lookup)
      const normalizedQueryPhone = phone.replace(/\D/g, '');
      const normalizedCustomerPhone = booking.customer.phone?.replace(/\D/g, '');

      if (!normalizedCustomerPhone || normalizedQueryPhone !== normalizedCustomerPhone) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid phone number for this booking');
      }

      sendResponse(res, 200, true, 'Booking retrieved', booking);
    } catch (error) {
      next(error);
    }
  }

  static async getScheduleAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getScheduleAvailability(req.tenant!.organizationId, req.params.scheduleId);
      sendResponse(res, 200, true, 'Availability retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
