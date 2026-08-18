import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { prisma } from '../../lib/prisma';
import { TourOperationService } from './tour-operation.service';

export class OperationsDashboardController {
  static async getKanbanBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.tenant!.organizationId;

      const operations = await prisma.tourOperation.findMany({
        where: { organizationId },
        include: {
          tourSchedule: {
            include: {
              tourPackage: { select: { title: true } }
            }
          }
        },
        orderBy: { plannedDepartureAt: 'asc' }
      });

      // Group operations by status
      const board = {
        DRAFT: operations.filter(op => op.status === 'DRAFT'),
        PREPARING: operations.filter(op => op.status === 'PREPARING'),
        READY: operations.filter(op => op.status === 'READY'),
        DEPARTED: operations.filter(op => op.status === 'DEPARTED'),
        IN_PROGRESS: operations.filter(op => op.status === 'IN_PROGRESS'),
        RETURNING: operations.filter(op => op.status === 'RETURNING'),
        COMPLETED: operations.filter(op => op.status === 'COMPLETED'),
      };

      sendResponse(res, 200, true, 'Kanban board retrieved', board);
    } catch (error) { next(error); }
  }

  static async getReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const organizationId = req.tenant!.organizationId;

      const readiness = await TourOperationService.checkReadiness(organizationId, scheduleId);
      
      // Optionally update the operation with latest readiness
      await prisma.tourOperation.update({
        where: { tourScheduleId: scheduleId },
        data: {
          readinessStatus: readiness.ready ? 'READY' : (readiness.percentage > 0 ? 'PARTIALLY_READY' : 'NOT_READY'),
          readinessPercentage: readiness.percentage
        }
      });

      sendResponse(res, 200, true, 'Tour readiness calculated', readiness);
    } catch (error) { next(error); }
  }

  static async updateReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      // Background job simulation or manual trigger to re-calculate all operations
      const organizationId = req.tenant!.organizationId;
      const activeOps = await prisma.tourOperation.findMany({
        where: { organizationId, status: { in: ['DRAFT', 'PREPARING'] } }
      });

      for (const op of activeOps) {
        const readiness = await TourOperationService.checkReadiness(organizationId, op.tourScheduleId);
        await prisma.tourOperation.update({
          where: { id: op.id },
          data: {
            readinessStatus: readiness.ready ? 'READY' : (readiness.percentage > 0 ? 'PARTIALLY_READY' : 'NOT_READY'),
            readinessPercentage: readiness.percentage
          }
        });
      }

      sendResponse(res, 200, true, 'Operations readiness updated');
    } catch (error) { next(error); }
  }
}
