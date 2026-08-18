import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const customTourRequestSchema = z.object({
  corporateClientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  destination: z.string().optional(),
  origin: z.string().optional(),
  travelStartDate: z.string().datetime().optional(),
  travelEndDate: z.string().datetime().optional(),
  duration: z.number().int().optional(),
  adultCount: z.number().int().optional(),
  childCount: z.number().int().optional(),
  infantCount: z.number().int().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  transportPreference: z.string().optional(),
  accommodationPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  activityPreference: z.string().optional(),
  specialRequirements: z.string().optional(),
  structuredRequirements: z.any().optional(), // Store as JSON
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['REQUESTED', 'REVIEWING', 'REQUIREMENTS_PENDING', 'PLANNING', 'QUOTATION_READY', 'QUOTATION_SENT', 'REVISION_REQUESTED', 'APPROVAL_PENDING', 'APPROVED', 'CONVERTED', 'REJECTED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

export class CustomTourRequestController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', status, leadId, corporateClientId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId };
      if (status) where.status = status;
      if (leadId) where.leadId = leadId;
      if (corporateClientId) where.corporateClientId = corporateClientId;

      const [data, total] = await Promise.all([
        prisma.customTourRequest.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customTourRequest.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Requests retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      // Calculate total travelers
      const totalTravelers = (data.adultCount || 0) + (data.childCount || 0) + (data.infantCount || 0);

      // Generate request number
      const requestNumber = `CTR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const request = await prisma.customTourRequest.create({
        data: { ...data, organizationId, requestNumber, totalTravelers }
      });

      sendResponse(res, 201, true, 'Custom tour request created', request);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      const existing = await prisma.customTourRequest.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Request not found');

      const totalTravelers = ((data.adultCount ?? existing.adultCount) || 0) 
                           + ((data.childCount ?? existing.childCount) || 0) 
                           + ((data.infantCount ?? existing.infantCount) || 0);

      // Versioning the structuredRequirements if it changed
      let structuredRequirements = existing.structuredRequirements;
      if (data.structuredRequirements && JSON.stringify(data.structuredRequirements) !== JSON.stringify(existing.structuredRequirements)) {
        // Here we could wrap the old one in a history array if we want, or just let the front-end handle versioning arrays
        structuredRequirements = data.structuredRequirements;
      }

      const updated = await prisma.customTourRequest.update({
        where: { id },
        data: { ...data, totalTravelers, structuredRequirements }
      });

      sendResponse(res, 200, true, 'Custom tour request updated', updated);
    } catch (error) { next(error); }
  }
}
