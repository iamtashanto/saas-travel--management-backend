import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';

export class CorporateReportController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;

      // Parallel queries for performance
      const [
        newLeadsCount,
        openOpportunities,
        acceptedQuotations,
        upcomingBookings,
        financials
      ] = await Promise.all([
        prisma.salesLead.count({ where: { organizationId, status: 'NEW' } }),
        prisma.salesLead.findMany({ 
          where: { organizationId, status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'REQUIREMENTS_COLLECTED', 'QUOTATION_PREPARING', 'QUOTATION_SENT', 'NEGOTIATION', 'APPROVAL_PENDING'] } },
          select: { budget: true, probability: true }
        }),
        prisma.quotation.count({ where: { organizationId, status: 'ACCEPTED' } }),
        prisma.booking.count({ where: { organizationId, bookingType: 'CORPORATE', status: { in: ['PENDING', 'CONFIRMED'] } } }),
        prisma.booking.aggregate({
          where: { organizationId, bookingType: 'CORPORATE' },
          _sum: { totalAmount: true, paidAmount: true, dueAmount: true }
        })
      ]);

      // Calculate pipeline
      let openOpportunityValue = 0;
      let weightedPipeline = 0;

      for (const opp of openOpportunities) {
        const budget = Number(opp.budget) || 0;
        const prob = Number(opp.probability) || 0;
        openOpportunityValue += budget;
        weightedPipeline += budget * (prob / 100);
      }

      const dashboard = {
        newLeadsCount,
        openOpportunityCount: openOpportunities.length,
        openOpportunityValue,
        weightedPipeline,
        acceptedQuotations,
        upcomingBookings,
        financials: {
          totalRevenue: financials._sum.totalAmount || 0,
          totalPaid: financials._sum.paidAmount || 0,
          outstandingDue: financials._sum.dueAmount || 0,
        }
      };

      sendResponse(res, 200, true, 'Corporate dashboard retrieved', dashboard);
    } catch (error) { next(error); }
  }

  static async getQuotationMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;

      const quotations = await prisma.quotation.findMany({
        where: { organizationId },
        select: { status: true, totalSellingPrice: true }
      });

      const metrics = quotations.reduce((acc: any, q) => {
        if (!acc[q.status]) {
          acc[q.status] = { count: 0, value: 0 };
        }
        acc[q.status].count += 1;
        acc[q.status].value += Number(q.totalSellingPrice) || 0;
        return acc;
      }, {});

      const accepted = metrics['ACCEPTED']?.count || 0;
      const total = quotations.length;
      const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

      sendResponse(res, 200, true, 'Quotation metrics retrieved', { metrics, conversionRate });
    } catch (error) { next(error); }
  }
}
