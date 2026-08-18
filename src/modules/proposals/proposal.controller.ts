import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const proposalSchema = z.object({
  quotationId: z.string().uuid(),
  title: z.string().min(1),
  validUntil: z.string().datetime(),
  introduction: z.string().optional(),
  content: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'INTERNAL_REVIEW', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']).optional()
});

export class ProposalController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', quotationId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId };
      if (quotationId) where.quotationId = quotationId;

      const [data, total] = await Promise.all([
        prisma.proposal.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' }
        }),
        prisma.proposal.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Proposals retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = req.body;
      const userId = req.user!.id;

      const proposalNumber = `PR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const proposal = await prisma.proposal.create({
        data: { ...data, organizationId, proposalNumber, createdBy: userId }
      });

      sendResponse(res, 201, true, 'Proposal created', proposal);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.proposal.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Proposal not found');

      const updated = await prisma.proposal.update({
        where: { id },
        data: req.body
      });

      sendResponse(res, 200, true, 'Proposal updated', updated);
    } catch (error) { next(error); }
  }

  static async send(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const updated = await prisma.proposal.update({
        where: { id, organizationId }, // Relies on unique constraints
        data: { status: 'SENT' }
      });

      sendResponse(res, 200, true, 'Proposal sent', updated);
    } catch (error) { 
      if (error instanceof AppError) next(error);
      else next(new AppError(404, 'NOT_FOUND', 'Proposal not found'));
    }
  }
}
