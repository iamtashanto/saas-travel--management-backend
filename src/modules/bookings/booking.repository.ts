import { Prisma, BookingStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ListBookingsQuery } from './booking.types';

export class BookingRepository {
  static async findBookings(organizationId: string, query: ListBookingsQuery) {
    const { page, limit, search, customerId, tourScheduleId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      organizationId,
    };

    if (customerId) where.customerId = customerId;
    if (tourScheduleId) where.tourScheduleId = tourScheduleId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { bookingReference: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true, phone: true } },
          tourPackage: { select: { title: true } },
          tourSchedule: { select: { startDate: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async findBookingById(id: string, organizationId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.booking.findUnique({
      where: { id, organizationId },
      include: {
        customer: true,
        tourPackage: true,
        tourSchedule: true,
        bookingTravelers: {
          include: { traveler: true },
        },
        bookingAddons: true,
        priceItems: true,
        seatReservations: true,
      },
    });
  }

  static async findBookingByReference(reference: string, organizationId: string) {
    return prisma.booking.findUnique({
      where: { organizationId_bookingReference: { organizationId, bookingReference: reference } },
      include: {
        customer: true,
        tourPackage: true,
        tourSchedule: true,
        bookingTravelers: {
          include: { traveler: true },
        },
        bookingAddons: true,
        priceItems: true,
      },
    });
  }
}
