import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { Prisma } from '@prisma/client';

export class DriverService {
  static async listDrivers(organizationId: string, page: number, limit: number, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.DriverWhereInput = { organizationId, isActive: true };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.driver.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.driver.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getDriver(id: string, organizationId: string) {
    const driver = await prisma.driver.findFirst({
      where: { id, organizationId },
      include: {
        DriverDutyLog: { orderBy: { startTime: 'desc' }, take: 10 },
      }
    });
    if (!driver) throw new AppError(404, 'NOT_FOUND', 'Driver not found');
    return driver;
  }

  static async createDriver(organizationId: string, data: any) {
    const existing = await prisma.driver.findFirst({
      where: { organizationId, licenseNumber: data.licenseNumber },
    });
    if (existing) throw new AppError(400, 'DUPLICATE_DRIVER', 'License number already exists');

    return prisma.driver.create({
      data: { ...data, organizationId },
    });
  }

  static async updateDriver(id: string, organizationId: string, data: any) {
    await this.getDriver(id, organizationId);
    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  static async deleteDriver(id: string, organizationId: string) {
    await this.getDriver(id, organizationId);
    return prisma.driver.update({
      where: { id },
      data: { isActive: false, status: 'INACTIVE' },
    });
  }

  // Extensions
  static async addDutyLog(driverId: string, organizationId: string, data: any) {
    await this.getDriver(driverId, organizationId);
    return prisma.driverDutyLog.create({
      data: { ...data, driverId, organizationId },
    });
  }
}
