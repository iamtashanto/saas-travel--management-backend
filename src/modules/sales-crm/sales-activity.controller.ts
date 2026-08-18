import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const salesActivitySchema = z.object({
  leadId: z.string().uuid().optional(),
  corporateClientId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'FOLLOW_UP', 'NOTE', 'DEMO', 'SITE_VISIT', 'OTHER']),
  subject: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
}).refine(data => data.leadId || data.corporateClientId, {
  message: "Either leadId or corporateClientId must be provided"
});

export class SalesActivityController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadId, corporateClientId } = req.query;
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId };
      if (leadId) where.leadId = leadId;
      if (corporateClientId) where.corporateClientId = corporateClientId;

      const activities = await prisma.salesActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      sendResponse(res, 200, true, 'Activities retrieved', activities);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      
      const activity = await prisma.salesActivity.create({
        data: { ...req.body, organizationId }
      });

      sendResponse(res, 201, true, 'Sales activity created', activity);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.salesActivity.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Activity not found');

      const updated = await prisma.salesActivity.update({
        where: { id },
        data: req.body
      });

      sendResponse(res, 200, true, 'Sales activity updated', updated);
    } catch (error) { next(error); }
  }
}
