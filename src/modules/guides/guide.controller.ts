import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const guideSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  experienceYears: z.number().int().optional(),
  languages: z.array(z.string()).optional(),
  specialization: z.string().optional(),
  emergencyContact: z.string().optional(),
  photoUrl: z.string().url().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'ON_LEAVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
});

export class GuideController {
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
        prisma.tourGuide.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
        prisma.tourGuide.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Guides retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const guide = await prisma.tourGuide.create({
        data: { ...req.body, organizationId: req.tenant!.organizationId },
      });
      sendResponse(res, 201, true, 'Guide created', guide);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const guide = await prisma.tourGuide.findFirst({ where: { id: req.params.id, organizationId } });
      if (!guide) throw new AppError(404, 'NOT_FOUND', 'Guide not found');

      const updated = await prisma.tourGuide.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendResponse(res, 200, true, 'Guide updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      await prisma.tourGuide.updateMany({
        where: { id: req.params.id, organizationId },
        data: { isActive: false, status: 'INACTIVE' },
      });
      sendResponse(res, 200, true, 'Guide archived');
    } catch (error) { next(error); }
  }
}
