import { TourScheduleRepository } from './tour-schedule.repository';
import { CreateScheduleInput, UpdateScheduleInput, ListSchedulesQuery, BulkCreateSchedulesInput } from './tour-schedule.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import { TourService } from './tour.service';

export class TourScheduleService {
  static async listSchedules(tourId: string, organizationId: string, query: ListSchedulesQuery) {
    // Verify tour exists
    await TourService.getTour(tourId, organizationId);
    return TourScheduleRepository.listSchedules(tourId, organizationId, query);
  }

  static async getSchedule(id: string, tourId: string, organizationId: string) {
    const schedule = await TourScheduleRepository.getScheduleById(id, tourId, organizationId);
    if (!schedule) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found');
    return schedule;
  }

  static async createSchedule(tourId: string, organizationId: string, data: CreateScheduleInput, actorUserId: string) {
    // Verify tour exists
    await TourService.getTour(tourId, organizationId);

    const schedule = await TourScheduleRepository.createSchedule({
      ...data,
      organization: { connect: { id: organizationId } },
      tourPackage: { connect: { id: tourId } }
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'SCHEDULE_CREATED',
        module: 'tourSchedules',
        entityType: 'TourSchedule',
        entityId: schedule.id,
      }
    });

    return schedule;
  }

  static async bulkCreateSchedules(tourId: string, organizationId: string, data: BulkCreateSchedulesInput, actorUserId: string) {
    // Verify tour exists
    await TourService.getTour(tourId, organizationId);

    const schedulesToCreate = data.schedules.map(s => ({
      ...s,
      organizationId,
      tourPackageId: tourId,
      status: 'DRAFT',
    }));

    await prisma.$transaction(async (tx) => {
      await tx.tourSchedule.createMany({
        data: schedulesToCreate as any
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'SCHEDULE_BULK_CREATED',
          module: 'tourSchedules',
          entityType: 'TourSchedule',
          entityId: tourId,
          metadata: { count: schedulesToCreate.length } as any,
        }
      });
    });

    return { success: true, count: schedulesToCreate.length };
  }

  static async updateSchedule(id: string, tourId: string, organizationId: string, data: UpdateScheduleInput, actorUserId: string) {
    const schedule = await this.getSchedule(id, tourId, organizationId);

    // Validate dates if partial update
    const newStartDate = data.startDate ? new Date(data.startDate) : new Date(schedule.startDate);
    const newEndDate = data.endDate ? new Date(data.endDate) : new Date(schedule.endDate);
    
    if (newStartDate > newEndDate) {
      throw new AppError(400, 'INVALID_SCHEDULE_DATES', 'startDate must be before or equal to endDate');
    }

    const newBookingOpen = data.bookingOpenAt !== undefined ? (data.bookingOpenAt ? new Date(data.bookingOpenAt) : null) : (schedule.bookingOpenAt ? new Date(schedule.bookingOpenAt) : null);
    const newBookingClose = data.bookingCloseAt !== undefined ? (data.bookingCloseAt ? new Date(data.bookingCloseAt) : null) : (schedule.bookingCloseAt ? new Date(schedule.bookingCloseAt) : null);

    if (newBookingOpen && newBookingClose && newBookingOpen >= newBookingClose) {
      throw new AppError(400, 'INVALID_SCHEDULE_DATES', 'bookingOpenAt must be before bookingCloseAt');
    }

    const updated = await TourScheduleRepository.updateSchedule(id, data as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'SCHEDULE_UPDATED',
        module: 'tourSchedules',
        entityType: 'TourSchedule',
        entityId: id,
        oldValues: { startDate: schedule.startDate, status: schedule.status } as any,
      }
    });

    return updated;
  }

  static async deleteSchedule(id: string, tourId: string, organizationId: string, actorUserId: string) {
    const schedule = await this.getSchedule(id, tourId, organizationId);

    // If future logic prevents deleting schedule with bookings, check here.
    // In Phase 05, no bookings exist. We can delete.

    await TourScheduleRepository.deleteSchedule(id);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'SCHEDULE_DELETED',
        module: 'tourSchedules',
        entityType: 'TourSchedule',
        entityId: id,
        metadata: { deletedStartDate: schedule.startDate } as any,
      }
    });

    return { deleted: true };
  }

  static async duplicateSchedule(id: string, tourId: string, organizationId: string, actorUserId: string, newStartDate: string, newEndDate: string) {
    const schedule = await this.getSchedule(id, tourId, organizationId);

    const sd = new Date(newStartDate);
    const ed = new Date(newEndDate);

    if (sd > ed) {
      throw new AppError(400, 'INVALID_SCHEDULE_DATES', 'startDate must be before or equal to endDate');
    }

    const duplicated = await prisma.$transaction(async (tx) => {
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = schedule as any;
      
      const newSchedule = await tx.tourSchedule.create({
        data: {
          ...rest,
          startDate: sd,
          endDate: ed,
          status: 'DRAFT',
        }
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'SCHEDULE_DUPLICATED',
          module: 'tourSchedules',
          entityType: 'TourSchedule',
          entityId: newSchedule.id,
          metadata: { originalId: id } as any,
        }
      });

      return newSchedule;
    });

    return {
      ...duplicated,
      basePriceOverride: duplicated.basePriceOverride ? duplicated.basePriceOverride.toNumber() : null,
      adultPrice: duplicated.adultPrice ? duplicated.adultPrice.toNumber() : null,
      childPrice: duplicated.childPrice ? duplicated.childPrice.toNumber() : null,
      infantPrice: duplicated.infantPrice ? duplicated.infantPrice.toNumber() : null,
    };
  }
}
