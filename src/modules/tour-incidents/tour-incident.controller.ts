import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { z } from 'zod';
import { AppError } from '../../utils/app-error';

export const incidentSchema = z.object({
  tourScheduleId: z.string().uuid(),
  type: z.enum(['MEDICAL', 'TRANSPORT', 'TRAVELER', 'HOTEL', 'WEATHER', 'SAFETY', 'SECURITY', 'FINANCE', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']),
});

export class TourIncidentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId, status } = req.query;
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId };
      if (scheduleId) where.tourScheduleId = scheduleId;
      if (status) where.status = status;

      const incidents = await prisma.tourIncident.findMany({
        where,
        orderBy: { reportedAt: 'desc' },
      });

      sendResponse(res, 200, true, 'Incidents retrieved', incidents);
    } catch (error) { next(error); }
  }

  static async report(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;

      const schedule = await prisma.tourSchedule.findUnique({
        where: { id: data.tourScheduleId, organizationId }
      });

      if (!schedule) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Tour schedule not found');

      const incident = await prisma.tourIncident.create({
        data: {
          ...data,
          organizationId,
          reportedBy: userId,
        }
      });

      sendResponse(res, 201, true, 'Incident reported', incident);
    } catch (error) { next(error); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;

      const incident = await prisma.tourIncident.findFirst({ where: { id, organizationId } });
      if (!incident) throw new AppError(404, 'NOT_FOUND', 'Incident not found');

      const updateData: any = { status };
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      }

      const updated = await prisma.tourIncident.update({
        where: { id },
        data: updateData,
      });

      sendResponse(res, 200, true, 'Incident updated', updated);
    } catch (error) { next(error); }
  }
}
