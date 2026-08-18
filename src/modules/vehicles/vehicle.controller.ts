import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const vehicleSchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().min(1),
  type: z.enum(['BUS', 'MICROBUS', 'CAR', 'BOAT', 'LAUNCH', 'OTHER']),
  capacity: z.number().int().positive(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'ON_LEAVE', 'INACTIVE']).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  manufactureYear: z.number().int().optional(),
  currentMileage: z.number().int().optional(),
  notes: z.string().optional(),
});

export class VehicleController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = { organizationId: req.tenant!.organizationId, isActive: true };
      if (status) where.status = status;
      if (search) where.registrationNumber = { contains: search as string, mode: 'insensitive' };

      const [data, total] = await Promise.all([
        prisma.vehicle.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
        prisma.vehicle.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Vehicles retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.vehicle.findFirst({
        where: { organizationId, registrationNumber: data.registrationNumber },
      });
      if (existing) throw new AppError(400, 'DUPLICATE_VEHICLE', 'Registration number already exists');

      const vehicle = await prisma.vehicle.create({
        data: { ...data, organizationId },
      });

      sendResponse(res, 201, true, 'Vehicle created', vehicle);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const vehicle = await prisma.vehicle.findFirst({ where: { id: req.params.id, organizationId } });
      if (!vehicle) throw new AppError(404, 'NOT_FOUND', 'Vehicle not found');

      const updated = await prisma.vehicle.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendResponse(res, 200, true, 'Vehicle updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      await prisma.vehicle.updateMany({
        where: { id: req.params.id, organizationId },
        data: { isActive: false, status: 'INACTIVE' },
      });
      sendResponse(res, 200, true, 'Vehicle archived');
    } catch (error) { next(error); }
  }
}
