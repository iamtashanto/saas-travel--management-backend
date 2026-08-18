import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListSchedulesQuery } from './tour-schedule.types';

export class TourScheduleRepository {
  static async listSchedules(tourId: string, organizationId: string, query: ListSchedulesQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TourScheduleWhereInput = {
      tourPackageId: tourId,
      organizationId,
    };

    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.startDate = {};
      if (query.startDate) where.startDate.gte = new Date(query.startDate);
      if (query.endDate) where.startDate.lte = new Date(query.endDate);
    }

    const [total, items] = await Promise.all([
      prisma.tourSchedule.count({ where }),
      prisma.tourSchedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sort || 'startDate']: query.order || 'asc' },
      })
    ]);

    return {
      items: items.map(item => ({
        ...item,
        basePriceOverride: item.basePriceOverride ? item.basePriceOverride.toNumber() : null,
        adultPrice: item.adultPrice ? item.adultPrice.toNumber() : null,
        childPrice: item.childPrice ? item.childPrice.toNumber() : null,
        infantPrice: item.infantPrice ? item.infantPrice.toNumber() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getScheduleById(id: string, tourId: string, organizationId: string) {
    const schedule = await prisma.tourSchedule.findFirst({
      where: { id, tourPackageId: tourId, organizationId }
    });

    if (!schedule) return null;

    return {
      ...schedule,
      basePriceOverride: schedule.basePriceOverride ? schedule.basePriceOverride.toNumber() : null,
      adultPrice: schedule.adultPrice ? schedule.adultPrice.toNumber() : null,
      childPrice: schedule.childPrice ? schedule.childPrice.toNumber() : null,
      infantPrice: schedule.infantPrice ? schedule.infantPrice.toNumber() : null,
    };
  }

  static async createSchedule(data: Prisma.TourScheduleCreateInput) {
    const schedule = await prisma.tourSchedule.create({ data });
    return {
      ...schedule,
      basePriceOverride: schedule.basePriceOverride ? schedule.basePriceOverride.toNumber() : null,
      adultPrice: schedule.adultPrice ? schedule.adultPrice.toNumber() : null,
      childPrice: schedule.childPrice ? schedule.childPrice.toNumber() : null,
      infantPrice: schedule.infantPrice ? schedule.infantPrice.toNumber() : null,
    };
  }

  static async bulkCreateSchedules(schedules: Prisma.TourScheduleCreateManyInput[]) {
    return prisma.tourSchedule.createMany({
      data: schedules
    });
  }

  static async updateSchedule(id: string, data: Prisma.TourScheduleUpdateInput) {
    const schedule = await prisma.tourSchedule.update({
      where: { id },
      data
    });
    return {
      ...schedule,
      basePriceOverride: schedule.basePriceOverride ? schedule.basePriceOverride.toNumber() : null,
      adultPrice: schedule.adultPrice ? schedule.adultPrice.toNumber() : null,
      childPrice: schedule.childPrice ? schedule.childPrice.toNumber() : null,
      infantPrice: schedule.infantPrice ? schedule.infantPrice.toNumber() : null,
    };
  }

  static async deleteSchedule(id: string) {
    return prisma.tourSchedule.delete({
      where: { id }
    });
  }
}
