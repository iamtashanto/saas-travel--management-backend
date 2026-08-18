import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { Prisma } from '@prisma/client';

export class VehicleService {
  // ---- VEHICLES ----
  
  static async listVehicles(organizationId: string, page: number, limit: number, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.VehicleWhereInput = { organizationId, isActive: true };
    if (status) where.status = status as any;
    if (search) where.registrationNumber = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.vehicle.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getVehicle(id: string, organizationId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, organizationId },
      include: {
        documents: true,
        maintenance: { orderBy: { date: 'desc' }, take: 5 },
        VehicleTripLog: { orderBy: { tripStart: 'desc' }, take: 5 },
        VehicleFuelRecord: { orderBy: { date: 'desc' }, take: 5 },
      }
    });
    if (!vehicle) throw new AppError(404, 'NOT_FOUND', 'Vehicle not found');
    return vehicle;
  }

  static async createVehicle(organizationId: string, data: any) {
    const existing = await prisma.vehicle.findFirst({
      where: { organizationId, registrationNumber: data.registrationNumber },
    });
    if (existing) throw new AppError(400, 'DUPLICATE_VEHICLE', 'Registration number already exists');

    return prisma.vehicle.create({
      data: { ...data, organizationId },
    });
  }

  static async updateVehicle(id: string, organizationId: string, data: any) {
    await this.getVehicle(id, organizationId);
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  static async deleteVehicle(id: string, organizationId: string) {
    await this.getVehicle(id, organizationId);
    return prisma.vehicle.update({
      where: { id },
      data: { isActive: false, status: 'INACTIVE' },
    });
  }

  // ---- DOCUMENTS ----

  static async addDocument(vehicleId: string, organizationId: string, data: any) {
    await this.getVehicle(vehicleId, organizationId);
    return prisma.vehicleDocument.create({
      data: { ...data, vehicleId },
    });
  }

  // ---- TRIP LOGS ----

  static async addTripLog(vehicleId: string, organizationId: string, data: any) {
    await this.getVehicle(vehicleId, organizationId);
    return prisma.vehicleTripLog.create({
      data: { ...data, vehicleId, organizationId },
    });
  }

  // ---- FUEL RECORDS ----

  static async addFuelRecord(vehicleId: string, organizationId: string, data: any) {
    await this.getVehicle(vehicleId, organizationId);
    return prisma.vehicleFuelRecord.create({
      data: { ...data, vehicleId, organizationId },
    });
  }

  // ---- MAINTENANCE ----

  static async addMaintenance(vehicleId: string, organizationId: string, data: any) {
    await this.getVehicle(vehicleId, organizationId);
    return prisma.vehicleMaintenance.create({
      data: { ...data, vehicleId, organizationId },
    });
  }

  static async updateMaintenance(id: string, organizationId: string, data: any) {
    const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Maintenance record not found');
    return prisma.vehicleMaintenance.update({
      where: { id },
      data,
    });
  }

  // ---- RENTALS ----

  static async addRental(vehicleId: string, organizationId: string, data: any) {
    await this.getVehicle(vehicleId, organizationId);
    return prisma.vehicleRental.create({
      data: { ...data, vehicleId, organizationId },
    });
  }
}
