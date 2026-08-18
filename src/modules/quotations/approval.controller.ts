import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';

export class ApprovalController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;
      const { status } = req.query;

      const where: any = { organizationId };
      if (status) where.status = status;

      const requests = await prisma.approvalRequest.findMany({
        where,
        orderBy: { requestedAt: 'desc' }
      });

      sendResponse(res, 200, true, 'Approval requests retrieved', requests);
    } catch (error) { next(error); }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.id;

      const request = await prisma.approvalRequest.findFirst({ where: { id, organizationId } });
      if (!request) throw new AppError(404, 'NOT_FOUND', 'Approval request not found');
      if (request.status !== 'PENDING') throw new AppError(400, 'INVALID_STATUS', 'Request is not pending');

      await prisma.$transaction(async (tx) => {
        await tx.approvalRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approverId: userId,
            resolvedAt: new Date(),
            resolutionNote: req.body.note
          }
        });

        if (request.entityType === 'QUOTATION') {
          await tx.quotation.update({
            where: { id: request.entityId },
            data: { status: 'DRAFT' } // Now it can be sent
          });
        }
      });

      sendResponse(res, 200, true, 'Request approved');
    } catch (error) { next(error); }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.id;

      const request = await prisma.approvalRequest.findFirst({ where: { id, organizationId } });
      if (!request) throw new AppError(404, 'NOT_FOUND', 'Approval request not found');

      await prisma.$transaction(async (tx) => {
        await tx.approvalRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approverId: userId,
            resolvedAt: new Date(),
            resolutionNote: req.body.note
          }
        });

        if (request.entityType === 'QUOTATION') {
          await tx.quotation.update({
            where: { id: request.entityId },
            data: { status: 'REJECTED' }
          });
        }
      });

      sendResponse(res, 200, true, 'Request rejected');
    } catch (error) { next(error); }
  }
}
