import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const corporateClientSchema = z.object({
  companyName: z.string().min(1),
  legalName: z.string().optional(),
  companyCode: z.string().optional(),
  industry: z.string().optional(),
  companyType: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonDesignation: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  contactPersonEmail: z.string().email().optional().or(z.literal('')),
  taxIdentifier: z.string().optional(),
  registrationNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
});

export class CorporateClientController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status, industry } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const organizationId = req.tenant!.organizationId;

      const where: any = { organizationId, archivedAt: null };
      if (status) where.status = status;
      if (industry) where.industry = industry;
      if (search) {
        where.OR = [
          { companyName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.corporateClient.findMany({ 
          where, 
          skip, 
          take: Number(limit), 
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { contacts: true, bookings: true, leads: true } } }
        }),
        prisma.corporateClient.count({ where }),
      ]);

      sendResponse(res, 200, true, 'Corporate clients retrieved', data, { page: Number(page), limit: Number(limit), total });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      const client = await prisma.corporateClient.create({
        data: { ...data, organizationId }
      });

      sendResponse(res, 201, true, 'Corporate client created', client);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { id } = req.params;

      const existing = await prisma.corporateClient.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'CORPORATE_CLIENT_NOT_FOUND', 'Client not found');

      const updated = await prisma.corporateClient.update({
        where: { id },
        data: req.body
      });

      sendResponse(res, 200, true, 'Corporate client updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { id } = req.params;

      const existing = await prisma.corporateClient.findFirst({ where: { id, organizationId } });
      if (!existing) throw new AppError(404, 'CORPORATE_CLIENT_NOT_FOUND', 'Client not found');

      // Soft delete
      await prisma.corporateClient.update({
        where: { id },
        data: { archivedAt: new Date(), status: 'INACTIVE' }
      });

      sendResponse(res, 200, true, 'Corporate client archived');
    } catch (error) { next(error); }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { id } = req.params;

      const client = await prisma.corporateClient.findFirst({
        where: { id, organizationId },
        include: {
          leads: { orderBy: { createdAt: 'desc' } },
          quotations: { orderBy: { createdAt: 'desc' } },
          contracts: { orderBy: { createdAt: 'desc' } },
          bookings: { orderBy: { createdAt: 'desc' } },
          activities: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!client) throw new AppError(404, 'CORPORATE_CLIENT_NOT_FOUND', 'Client not found');

      // Combine and sort chronologically
      const history = [
        ...client.leads.map(l => ({ type: 'LEAD', date: l.createdAt, data: l })),
        ...client.quotations.map(q => ({ type: 'QUOTATION', date: q.createdAt, data: q })),
        ...client.contracts.map(c => ({ type: 'CONTRACT', date: c.createdAt, data: c })),
        ...client.bookings.map(b => ({ type: 'BOOKING', date: b.createdAt, data: b })),
        ...client.activities.map(a => ({ type: 'ACTIVITY', date: a.createdAt, data: a })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      sendResponse(res, 200, true, 'Client history retrieved', history);
    } catch (error) { next(error); }
  }

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { id } = req.params;

      const client = await prisma.corporateClient.findFirst({
        where: { id, organizationId },
        include: {
          _count: {
            select: { leads: true, quotations: true, contracts: true, bookings: true }
          },
          bookings: { select: { totalAmount: true, paidAmount: true, dueAmount: true } }
        }
      });

      if (!client) throw new AppError(404, 'CORPORATE_CLIENT_NOT_FOUND', 'Client not found');

      const totalRevenue = client.bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
      const totalPaid = client.bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
      const outstandingDue = client.bookings.reduce((sum, b) => sum + Number(b.dueAmount), 0);

      const summary = {
        companyName: client.companyName,
        status: client.status,
        counts: client._count,
        financials: { totalRevenue, totalPaid, outstandingDue }
      };

      sendResponse(res, 200, true, 'Client summary retrieved', summary);
    } catch (error) { next(error); }
  }
}
