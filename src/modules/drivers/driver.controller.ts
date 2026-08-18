import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const driverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  alternatePhone: z.string().optional(),
  licenseNumber: z.string().min(1),
  licenseType: z.string().optional(),
  licenseExpiryDate: z.string().datetime(),
  experienceYears: z.number().int().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

export class DriverController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = { organizationId: req.tenant!.organizationId, isActive: true };
      if (status) where.status = status;
      if (search) where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];

      const [data, total] = await Promise.all([
        prisma.driver.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
        prisma.driver.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Drivers retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.driver.findFirst({
        where: { organizationId, licenseNumber: data.licenseNumber },
      });
      if (existing) throw new AppError(400, 'DUPLICATE_DRIVER', 'License number already exists');

      const driver = await prisma.driver.create({
        data: { ...data, organizationId },
      });

      sendResponse(res, 201, true, 'Driver created', driver);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const driver = await prisma.driver.findFirst({ where: { id: req.params.id, organizationId } });
      if (!driver) throw new AppError(404, 'NOT_FOUND', 'Driver not found');

      const updated = await prisma.driver.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendResponse(res, 200, true, 'Driver updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      await prisma.driver.updateMany({
        where: { id: req.params.id, organizationId },
        data: { isActive: false, status: 'INACTIVE' },
      });
      sendResponse(res, 200, true, 'Driver archived');
    } catch (error) { next(error); }
  }
}
