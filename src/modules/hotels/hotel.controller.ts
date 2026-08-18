import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const hotelSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'INACTIVE']).optional(),
});

export const hotelRoomTypeSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().min(1),
  totalRooms: z.number().int().min(0),
  basePrice: z.number().min(0).optional(),
  description: z.string().optional(),
});

export class HotelController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, city } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = { organizationId: req.tenant!.organizationId, isActive: true };
      if (city) where.city = city;
      if (search) where.name = { contains: search as string, mode: 'insensitive' };

      const [data, total] = await Promise.all([
        prisma.hotel.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' },
          include: { roomTypes: true }
        }),
        prisma.hotel.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Hotels retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const hotel = await prisma.hotel.create({
        data: { ...req.body, organizationId: req.tenant!.organizationId },
      });
      sendResponse(res, 201, true, 'Hotel created', hotel);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const hotel = await prisma.hotel.findFirst({ where: { id: req.params.id, organizationId } });
      if (!hotel) throw new AppError(404, 'NOT_FOUND', 'Hotel not found');

      const updated = await prisma.hotel.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendResponse(res, 200, true, 'Hotel updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      await prisma.hotel.updateMany({
        where: { id: req.params.id, organizationId },
        data: { isActive: false, status: 'INACTIVE' },
      });
      sendResponse(res, 200, true, 'Hotel archived');
    } catch (error) { next(error); }
  }

  // Room Types
  static async addRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const hotelId = req.params.hotelId;
      
      const hotel = await prisma.hotel.findFirst({ where: { id: hotelId, organizationId } });
      if (!hotel) throw new AppError(404, 'NOT_FOUND', 'Hotel not found');

      const roomType = await prisma.hotelRoomType.create({
        data: { ...req.body, hotelId, organizationId },
      });
      sendResponse(res, 201, true, 'Room type added', roomType);
    } catch (error) { next(error); }
  }
}
