import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { QuotationService } from './quotation.service';
import { z } from 'zod';

export const quotationItemSchema = z.object({
  serviceType: z.string(),
  description: z.string(),
  quantity: z.number().int().min(1),
  unit: z.string().optional(),
  unitCostPrice: z.number().min(0),
  unitSellingPrice: z.number().min(0),
  discount: z.number().optional(),
  tax: z.number().optional()
});

export const quotationSchema = z.object({
  corporateClientId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  customTourRequestId: z.string().uuid().optional(),
  validUntil: z.string().datetime(),
  currency: z.string().optional(),
  discountAmount: z.number().optional(),
  taxAmount: z.number().optional(),
  feeAmount: z.number().optional(),
  paymentTerms: z.string().optional(),
  cancellationTerms: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(quotationItemSchema),
  paymentMilestones: z.array(z.object({
    name: z.string(),
    percentage: z.number().optional(),
    amount: z.number(),
    dueDate: z.string().datetime().optional()
  })).optional()
});

export class QuotationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', corporateClientId, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId, archivedAt: null };
      if (corporateClientId) where.corporateClientId = corporateClientId;
      if (status) where.status = status;

      const [data, total] = await Promise.all([
        prisma.quotation.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' },
          include: { corporateClient: { select: { companyName: true } } }
        }),
        prisma.quotation.count({ where }),
      ]);

      // Remove cost internally from list response for safety if needed, but this is a staff API.
      sendResponse(res, 200, true, 'Quotations retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quotation = await prisma.quotation.findFirst({
        where: { id, organizationId: req.tenant!.organizationId },
        include: { items: true, paymentMilestones: true, childQuotations: true }
      });
      if (!quotation) throw new AppError(404, 'QUOTATION_NOT_FOUND', 'Quotation not found');

      sendResponse(res, 200, true, 'Quotation retrieved', quotation);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.id;
      const quotation = await QuotationService.createQuotation(organizationId, req.body, userId);
      sendResponse(res, 201, true, 'Quotation created', quotation);
    } catch (error) { next(error); }
  }

  static async revise(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { changeReason, ...data } = req.body;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.id;

      if (!changeReason) throw new AppError(400, 'BAD_REQUEST', 'changeReason is required');

      const quotation = await QuotationService.createRevision(organizationId, id, data, userId, changeReason);
      sendResponse(res, 201, true, 'Quotation revised', quotation);
    } catch (error) { next(error); }
  }

  static async send(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const quotation = await prisma.quotation.findFirst({ where: { id, organizationId } });
      if (!quotation) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');

      if (quotation.status === 'INTERNAL_REVIEW') {
         throw new AppError(403, 'APPROVAL_REQUIRED', 'Quotation requires approval due to negative margin');
      }

      const updated = await prisma.quotation.update({
        where: { id },
        data: { status: 'SENT' }
      });

      sendResponse(res, 200, true, 'Quotation sent', updated);
    } catch (error) { next(error); }
  }

  static async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      
      const quotation = await prisma.quotation.findFirst({ where: { id, organizationId } });
      if (!quotation) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');
      if (['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(quotation.status)) {
         throw new AppError(400, 'INVALID_STATUS', 'Quotation cannot be accepted');
      }

      if (new Date(quotation.validUntil).getTime() < Date.now()) {
        throw new AppError(400, 'QUOTATION_EXPIRED', 'Quotation has expired');
      }

      const updated = await prisma.quotation.update({
        where: { id },
        data: { 
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedBy: req.body.acceptedBy || 'Client',
          acceptanceMethod: req.body.acceptanceMethod || 'MANUAL',
          acceptanceNote: req.body.acceptanceNote
        }
      });

      sendResponse(res, 200, true, 'Quotation accepted', updated);
    } catch (error) { next(error); }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      
      const updated = await prisma.quotation.update({
        where: { id, organizationId },
        data: { 
          status: 'REJECTED',
          rejectedAt: new Date(),
          rejectedBy: req.body.rejectedBy || 'Client',
          rejectReason: req.body.rejectReason
        }
      });

      sendResponse(res, 200, true, 'Quotation rejected', updated);
    } catch (error) { next(error); }
  }

  static async convertToBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.id;

      const booking = await QuotationService.convertToBooking(organizationId, id, userId);
      
      sendResponse(res, 200, true, 'Quotation converted to booking', booking);
    } catch (error) { next(error); }
  }
}
