import { Request, Response, NextFunction } from 'express';
import { TourOperationService } from './tour-operation.service';
import { sendResponse } from '../../utils/response';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export const changeStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PREPARING', 'READY', 'DEPARTED', 'IN_PROGRESS', 'RETURNING', 'COMPLETED', 'CANCELLED']),
});

export class TourOperationController {
  static async getOperationBySchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const operation = await TourOperationService.getOrCreateOperation(req.tenant!.organizationId, req.params.scheduleId);
      sendResponse(res, 200, true, 'Operation retrieved', operation);
    } catch (error) { next(error); }
  }

  static async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await TourOperationService.changeStatus(
        req.tenant!.organizationId, 
        req.params.id, 
        req.body.status, 
        req.user!.userId
      );
      sendResponse(res, 200, true, 'Operation status updated', updated);
    } catch (error) { next(error); }
  }

  static async getReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      const readiness = await TourOperationService.checkReadiness(req.tenant!.organizationId, req.params.scheduleId);
      sendResponse(res, 200, true, 'Readiness retrieved', readiness);
    } catch (error) { next(error); }
  }

  static async updateChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const { isCompleted } = req.body;
      const organizationId = req.tenant!.organizationId;

      const updated = await prisma.operationalChecklistItem.update({
        where: { id: itemId, checklist: { organizationId } },
        data: { 
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          completedBy: isCompleted ? req.user!.userId : null
        }
      });
      sendResponse(res, 200, true, 'Checklist item updated', updated);
    } catch (error) { next(error); }
  }
}
