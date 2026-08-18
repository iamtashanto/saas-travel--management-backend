import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const checkInSchema = z.object({
  travelerIds: z.array(z.string().uuid()),
});

export class TravelerOperationsController {
  static async listTravelers(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const organizationId = req.tenant!.organizationId;

      const travelers = await prisma.bookingTraveler.findMany({
        where: {
          booking: { tourScheduleId: scheduleId, organizationId, status: 'CONFIRMED' }
        },
        include: {
          traveler: true,
          booking: { select: { bookingReference: true } }
        }
      });

      sendResponse(res, 200, true, 'Operational travelers retrieved', travelers);
    } catch (error) { next(error); }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const { travelerIds } = req.body;
      const userId = req.user!.userId;
      const organizationId = req.tenant!.organizationId;

      await prisma.$transaction(async (tx) => {
        const travelers = await tx.bookingTraveler.findMany({
          where: {
            id: { in: travelerIds },
            booking: { tourScheduleId: scheduleId, organizationId }
          }
        });

        if (travelers.length !== travelerIds.length) {
          throw new AppError(400, 'INVALID_TRAVELERS', 'Some travelers do not belong to this schedule');
        }

        const now = new Date();
        await tx.bookingTraveler.updateMany({
          where: { id: { in: travelerIds }, operationalStatus: { in: ['BOOKED', 'CONFIRMED'] } },
          data: {
            operationalStatus: 'CHECKED_IN',
            checkedInAt: now,
            checkedInBy: userId
          }
        });
      });

      sendResponse(res, 200, true, 'Travelers checked in successfully');
    } catch (error) { next(error); }
  }

  static async board(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const { travelerIds } = req.body;
      const userId = req.user!.userId;
      const organizationId = req.tenant!.organizationId;

      await prisma.$transaction(async (tx) => {
        const now = new Date();
        await tx.bookingTraveler.updateMany({
          where: { 
            id: { in: travelerIds },
            booking: { tourScheduleId: scheduleId, organizationId },
            operationalStatus: 'CHECKED_IN' // Must be checked in first
          },
          data: {
            operationalStatus: 'BOARDED',
            boardedAt: now,
            boardedBy: userId
          }
        });
      });

      sendResponse(res, 200, true, 'Travelers boarded successfully');
    } catch (error) { next(error); }
  }
}
