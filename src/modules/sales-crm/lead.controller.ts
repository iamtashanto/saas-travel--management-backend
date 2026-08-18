import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const leadSchema = z.object({
  corporateClientId: z.string().uuid().optional(),
  title: z.string().min(1),
  source: z.enum(['WEBSITE', 'FACEBOOK', 'WHATSAPP', 'PHONE', 'EMAIL', 'REFERRAL', 'EXISTING_CLIENT', 'PARTNER', 'DIRECT', 'OTHER']).optional(),
  description: z.string().optional(),
  destination: z.string().optional(),
  estimatedTravelers: z.number().int().optional(),
  expectedDate: z.string().datetime().optional(),
  budget: z.number().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'REQUIREMENTS_COLLECTED', 'QUOTATION_PREPARING', 'QUOTATION_SENT', 'NEGOTIATION', 'APPROVAL_PENDING', 'WON', 'LOST', 'CANCELLED']).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  lostReason: z.string().optional(),
  notes: z.string().optional()
});

export class LeadController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status, priority, assignedTo } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId, archivedAt: null };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (assignedTo) where.assignedTo = assignedTo;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { leadNumber: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.salesLead.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' },
          include: { corporateClient: { select: { companyName: true } } }
        }),
        prisma.salesLead.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Leads retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      // Generate sequence number
      const leadNumber = `LD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const lead = await prisma.salesLead.create({
        data: { ...data, organizationId, leadNumber }
      });

      sendResponse(res, 201, true, 'Lead created', lead);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { id } = req.params;

      const existing = await prisma.salesLead.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'LEAD_NOT_FOUND', 'Lead not found');

      // If status is LOST, ensure lostReason is provided
      if (req.body.status === 'LOST' && existing.status !== 'LOST' && !req.body.lostReason) {
         throw new AppError(400, 'LOST_REASON_REQUIRED', 'A reason is required when marking a lead as LOST');
      }

      const updated = await prisma.salesLead.update({
        where: { id },
        data: req.body
      });

      sendResponse(res, 200, true, 'Lead updated', updated);
    } catch (error) { next(error); }
  }

  static async getPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;

      const leads = await prisma.salesLead.findMany({
        where: { organizationId, archivedAt: null },
        select: { status: true, budget: true, probability: true }
      });

      const pipeline = leads.reduce((acc: any, lead) => {
        if (!acc[lead.status]) {
          acc[lead.status] = { stage: lead.status, leadCount: 0, totalEstimatedValue: 0, weightedValue: 0 };
        }
        acc[lead.status].leadCount += 1;
        const val = Number(lead.budget) || 0;
        acc[lead.status].totalEstimatedValue += val;
        acc[lead.status].weightedValue += val * ((lead.probability || 0) / 100);
        return acc;
      }, {});

      sendResponse(res, 200, true, 'Pipeline retrieved', Object.values(pipeline));
    } catch (error) { next(error); }
  }
}
