import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const contractSchema = z.object({
  corporateClientId: z.string().uuid(),
  quotationId: z.string().uuid().optional(),
  proposalId: z.string().uuid().optional(),
  title: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  contractValue: z.number().min(0),
  currency: z.string().optional(),
  paymentTerms: z.string().optional(),
  cancellationTerms: z.string().optional(),
  specialTerms: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'UNDER_REVIEW', 'SIGNED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED']).optional()
});

export class ContractController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', corporateClientId, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId, archivedAt: null };
      if (corporateClientId) where.corporateClientId = corporateClientId;
      if (status) where.status = status;

      const [data, total] = await Promise.all([
        prisma.corporateContract.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' }
        }),
        prisma.corporateContract.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Contracts retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = req.body;
      const userId = req.user!.id;

      const contractNumber = `CNT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const contract = await prisma.corporateContract.create({
        data: { ...data, organizationId, contractNumber, createdBy: userId }
      });

      sendResponse(res, 201, true, 'Contract created', contract);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.corporateContract.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Contract not found');

      if (existing.status === 'SIGNED' && req.body.status && req.body.status !== 'SIGNED' && req.body.status !== 'TERMINATED' && req.body.status !== 'EXPIRED' && req.body.status !== 'ACTIVE') {
         throw new AppError(400, 'INVALID_TRANSITION', 'Cannot modify signed contract status inappropriately');
      }

      const updated = await prisma.corporateContract.update({
        where: { id },
        data: req.body
      });

      sendResponse(res, 200, true, 'Contract updated', updated);
    } catch (error) { next(error); }
  }

  static async sign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const existing = await prisma.corporateContract.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'NOT_FOUND', 'Contract not found');
      if (existing.status === 'SIGNED' || existing.status === 'ACTIVE') {
         throw new AppError(400, 'CONTRACT_ALREADY_SIGNED', 'Contract is already signed or active');
      }

      const updated = await prisma.corporateContract.update({
        where: { id },
        data: { 
          status: 'SIGNED', 
          signedAt: new Date(),
          signedBy: req.body.signedBy || 'Client',
          documentUrl: req.body.documentUrl
        }
      });

      sendResponse(res, 200, true, 'Contract signed', updated);
    } catch (error) { next(error); }
  }

  static async terminate(req: Request, res: Response, next: NextFunction) {
     try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const updated = await prisma.corporateContract.update({
        where: { id, organizationId },
        data: { 
          status: 'TERMINATED',
          changeReason: req.body.reason
        }
      });

      sendResponse(res, 200, true, 'Contract terminated', updated);
    } catch (error) { 
      if (error instanceof AppError) next(error);
      else next(new AppError(404, 'NOT_FOUND', 'Contract not found'));
    }
  }
}
