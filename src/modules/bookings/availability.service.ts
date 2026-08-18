import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class AvailabilityService {
  /**
   * Asserts and holds capacity in a highly concurrent environment.
   * MUST be run within a Prisma transaction (`tx`).
   */
  static async assertAndHoldCapacity(
    organizationId: string,
    tourScheduleId: string,
    bookingId: string,
    requestedQuantity: number,
    tx: Prisma.TransactionClient,
    holdDurationMinutes = 15,
  ) {
    // 1. Lock the tour schedule row to prevent concurrent capacity updates from evaluating simultaneously
    const schedule = await tx.$queryRaw<{ capacity: number }[]>`
      SELECT capacity 
      FROM tour_schedules 
      WHERE id = ${tourScheduleId}::uuid AND "organizationId" = ${organizationId}::uuid
      FOR UPDATE
    `;

    if (!schedule || schedule.length === 0) {
      throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Tour schedule not found');
    }

    const maxCapacity = schedule[0].capacity;

    // 2. Calculate currently consumed capacity (CONFIRMED + active HELD)
    const result = await tx.$queryRaw<{ sum: number }[]>`
      SELECT COALESCE(SUM(quantity), 0) as sum
      FROM seat_reservations
      WHERE "tourScheduleId" = ${tourScheduleId}::uuid
        AND "organizationId" = ${organizationId}::uuid
        AND (
          status = 'CONFIRMED' 
          OR (status = 'HELD' AND "expiresAt" > NOW())
        )
    `;

    const consumedCapacity = Number(result[0].sum);
    const availableCapacity = maxCapacity - consumedCapacity;

    // 3. Check availability
    if (availableCapacity < requestedQuantity) {
      throw new AppError(409, 'INSUFFICIENT_CAPACITY', `Only ${availableCapacity} seats available`);
    }

    // 4. Create the seat reservation hold
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60000);
    const seatReservation = await tx.seatReservation.create({
      data: {
        organizationId,
        bookingId,
        tourScheduleId,
        quantity: requestedQuantity,
        status: 'HELD',
        expiresAt,
      },
    });

    return seatReservation;
  }

  /**
   * Retrieves public availability for a schedule without locking
   */
  static async getScheduleAvailability(organizationId: string, tourScheduleId: string) {
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: tourScheduleId, organizationId },
      select: { capacity: true, status: true },
    });

    if (!schedule) {
      throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Tour schedule not found');
    }

    const result = await prisma.$queryRaw<{ sum: number }[]>`
      SELECT COALESCE(SUM(quantity), 0) as sum
      FROM seat_reservations
      WHERE "tourScheduleId" = ${tourScheduleId}::uuid
        AND "organizationId" = ${organizationId}::uuid
        AND (
          status = 'CONFIRMED' 
          OR (status = 'HELD' AND "expiresAt" > NOW())
        )
    `;

    const consumedCapacity = Number(result[0].sum);
    const availableCapacity = schedule.capacity - consumedCapacity;

    return {
      capacity: schedule.capacity,
      consumed: consumedCapacity,
      available: availableCapacity > 0 ? availableCapacity : 0,
      status: schedule.status,
    };
  }
}
