import { Prisma, BookingStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { CreateBookingInput, PublicCreateBookingInput, UpdateBookingStatusInput, ListBookingsQuery } from './booking.types';
import { BookingRepository } from './booking.repository';
import { BookingPricingService } from './pricing.service';
import { AvailabilityService } from './availability.service';
import { BookingStateMachine } from './booking.state-machine';
import { AuditLogService } from '../audit-logs/audit-log.service';

export class BookingService {
  /**
   * Generates a unique sequential booking reference per organization.
   * Runs in a transaction with row lock.
   */
  private static async generateBookingReference(organizationId: string, tx: Prisma.TransactionClient): Promise<string> {
    const result = await tx.$queryRaw<{ prefix: string; currentValue: number; padding: number }[]>`
      UPDATE sequences
      SET "currentValue" = "currentValue" + 1
      WHERE "organizationId" = ${organizationId}::uuid AND key = 'BOOKING'
      RETURNING prefix, "currentValue", padding
    `;

    if (result && result.length > 0) {
      const { prefix, currentValue, padding } = result[0];
      return `${prefix}${currentValue.toString().padStart(padding, '0')}`;
    }

    // Fallback if sequence is missing
    const settings = await tx.organizationSettings.findUnique({ where: { organizationId } });
    const fallbackPrefix = settings?.bookingPrefix || 'BKG';

    const newSeq = await tx.sequence.create({
      data: {
        organizationId,
        key: 'BOOKING',
        prefix: fallbackPrefix,
        currentValue: 1,
        padding: 5,
      },
    });

    return `${newSeq.prefix}${newSeq.currentValue.toString().padStart(newSeq.padding, '0')}`;
  }

  static async listBookings(organizationId: string, query: ListBookingsQuery) {
    return BookingRepository.findBookings(organizationId, query);
  }

  static async getBookingById(id: string, organizationId: string) {
    const booking = await BookingRepository.findBookingById(id, organizationId);
    if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
    return booking;
  }

  static async createBooking(organizationId: string, data: CreateBookingInput, actorUserId?: string) {
    // Determine traveler counts
    const travelerCount = data.travelers.length;

    // Pricing calculation
    const pricingResult = await BookingPricingService.calculatePricing({
      organizationId,
      tourPackageId: data.tourPackageId,
      tourScheduleId: data.tourScheduleId,
      travelers: data.travelers.map((t) => ({ type: t.type })),
      addons: data.addons,
    });

    const booking = await prisma.$transaction(async (tx) => {
      // 1. Assert Capacity and Hold Seats
      await AvailabilityService.assertAndHoldCapacity(
        organizationId,
        data.tourScheduleId,
        '00000000-0000-0000-0000-000000000000', // Placeholder until booking is created
        travelerCount,
        tx,
        15 // 15 mins hold
      );

      // 2. Generate Reference
      const bookingReference = await this.generateBookingReference(organizationId, tx);

      // 3. Create Booking Root
      const newBooking = await tx.booking.create({
        data: {
          organizationId,
          bookingReference,
          customerId: data.customerId,
          tourPackageId: data.tourPackageId,
          tourScheduleId: data.tourScheduleId,
          status: 'HELD',
          bookingSource: data.bookingSource || 'WEBSITE',
          currency: pricingResult.pricing.currency,
          subtotal: pricingResult.totals.subtotal,
          addonAmount: pricingResult.totals.addonAmount,
          discountAmount: pricingResult.totals.discountAmount,
          feeAmount: pricingResult.totals.feeAmount,
          totalAmount: pricingResult.totals.totalAmount,
          dueAmount: pricingResult.totals.totalAmount,
          travelerCount: pricingResult.counts.travelerCount,
          adultCount: pricingResult.counts.adultCount,
          childCount: pricingResult.counts.childCount,
          infantCount: pricingResult.counts.infantCount,
          specialRequest: data.specialRequest,
          internalNote: data.internalNote,
          expiresAt: new Date(Date.now() + 15 * 60000),
          createdBy: actorUserId,
          updatedBy: actorUserId,
        },
      });

      // 4. Update the seat reservation with real booking ID
      await tx.seatReservation.updateMany({
        where: { tourScheduleId: data.tourScheduleId, bookingId: '00000000-0000-0000-0000-000000000000' },
        data: { bookingId: newBooking.id },
      });

      // 5. Create Travelers Snapshot
      for (const t of data.travelers) {
        const travelerRec = await tx.traveler.findUnique({ where: { id: t.travelerId } });
        if (!travelerRec) throw new AppError(404, 'TRAVELER_NOT_FOUND', `Traveler ${t.travelerId} not found`);

        let unitPrice = new Prisma.Decimal(0);
        if (t.type === 'ADULT') unitPrice = pricingResult.pricing.adultPrice;
        if (t.type === 'CHILD') unitPrice = pricingResult.pricing.childPrice;
        if (t.type === 'INFANT') unitPrice = pricingResult.pricing.infantPrice;

        await tx.bookingTraveler.create({
          data: {
            bookingId: newBooking.id,
            travelerId: t.travelerId,
            travelerType: t.type,
            firstName: travelerRec.firstName,
            lastName: travelerRec.lastName,
            phone: travelerRec.phone,
            email: travelerRec.email,
            unitPrice,
            pickupPointId: t.pickupPointId,
            specialRequirement: t.specialRequirement,
          },
        });
      }

      // 6. Create Addons Snapshot
      for (const a of pricingResult.addonDetails) {
        await tx.bookingAddon.create({
          data: {
            bookingId: newBooking.id,
            tourAddonId: a.addon.id,
            nameSnapshot: a.addon.name,
            quantity: a.quantity,
            unitPrice: a.unitPrice,
            totalPrice: a.totalPrice,
            currency: a.addon.currency,
          },
        });
      }

      // 7. Status History
      await tx.bookingStatusHistory.create({
        data: {
          organizationId,
          bookingId: newBooking.id,
          toStatus: 'HELD',
          reason: 'Initial booking creation',
          changedBy: actorUserId,
        },
      });

      return newBooking;
    });

    if (actorUserId) {
      await AuditLogService.log(organizationId, actorUserId, 'BOOKING_CREATE', 'Booking', booking.id, { bookingReference: booking.bookingReference });
    }

    return booking;
  }

  static async updateBookingStatus(id: string, organizationId: string, data: UpdateBookingStatusInput, actorUserId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await BookingRepository.findBookingById(id, organizationId, tx);
      if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');

      BookingStateMachine.assertTransition(booking.status, data.status);

      const updateData: Prisma.BookingUpdateInput = {
        status: data.status,
        updatedBy: actorUserId,
      };

      if (data.status === 'CONFIRMED') updateData.confirmedAt = new Date();
      if (data.status === 'CANCELLED') updateData.cancelledAt = new Date();
      if (data.status === 'COMPLETED') updateData.completedAt = new Date();

      const updated = await tx.booking.update({
        where: { id },
        data: updateData,
      });

      await tx.bookingStatusHistory.create({
        data: {
          organizationId,
          bookingId: id,
          fromStatus: booking.status,
          toStatus: data.status,
          reason: data.reason,
          changedBy: actorUserId,
        },
      });

      // Handle Seat Reservation capacity
      if (data.status === 'CONFIRMED') {
        await tx.seatReservation.updateMany({
          where: { bookingId: id },
          data: { status: 'CONFIRMED', expiresAt: null },
        });
      } else if (data.status === 'CANCELLED') {
        await tx.seatReservation.updateMany({
          where: { bookingId: id },
          data: { status: 'RELEASED' },
        });
      }

      return updated;
    });
  }

  static async getScheduleAvailability(organizationId: string, tourScheduleId: string) {
    return AvailabilityService.getScheduleAvailability(organizationId, tourScheduleId);
  }

  // To be used by Cron / Background worker
  static async expireBookingHolds() {
    const expiredReservations = await prisma.seatReservation.findMany({
      where: {
        status: 'HELD',
        expiresAt: { lt: new Date() },
      },
    });

    for (const res of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // Double check it's still held
        const current = await tx.seatReservation.findUnique({ where: { id: res.id } });
        if (current?.status !== 'HELD') return;

        await tx.seatReservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        const booking = await tx.booking.findUnique({ where: { id: res.bookingId } });
        if (booking && booking.status === 'HELD') {
          await tx.booking.update({
            where: { id: res.bookingId },
            data: { status: 'EXPIRED' },
          });

          await tx.bookingStatusHistory.create({
            data: {
              organizationId: booking.organizationId,
              bookingId: booking.id,
              fromStatus: 'HELD',
              toStatus: 'EXPIRED',
              reason: 'Hold time expired automatically',
            },
          });
        }
      });
    }
  }
}
