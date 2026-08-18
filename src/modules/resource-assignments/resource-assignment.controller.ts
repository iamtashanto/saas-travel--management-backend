import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const assignTransportSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  departureAt: z.string().datetime().optional(),
  returnAt: z.string().datetime().optional(),
  seatCapacity: z.number().int().min(1),
  notes: z.string().optional(),
});

export class ResourceAssignmentController {
  static async assignTransport(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const data = req.body;
      const organizationId = req.tenant!.organizationId;

      const assignment = await prisma.$transaction(async (tx) => {
        // 1. Verify vehicle exists and is active
        const vehicle = await tx.vehicle.findFirst({ where: { id: data.vehicleId, organizationId, isActive: true } });
        if (!vehicle) throw new AppError(404, 'VEHICLE_NOT_FOUND', 'Vehicle not found or inactive');

        // 2. Detect Vehicle Conflict (simplified logic: check overlapping assignments)
        if (data.departureAt && data.returnAt) {
          const conflictingVehicle = await tx.tourTransportAssignment.findFirst({
            where: {
              vehicleId: data.vehicleId,
              status: 'ASSIGNED',
              departureAt: { lt: data.returnAt },
              returnAt: { gt: data.departureAt }
            }
          });
          if (conflictingVehicle) throw new AppError(409, 'RESOURCE_CONFLICT', 'Vehicle is already assigned during this period');
        }

        // 3. Detect Driver Conflict
        if (data.driverId) {
          const driver = await tx.driver.findFirst({ where: { id: data.driverId, organizationId, isActive: true } });
          if (!driver) throw new AppError(404, 'DRIVER_NOT_FOUND', 'Driver not found');
          
          if (driver.licenseExpiryDate < new Date()) {
            throw new AppError(400, 'DRIVER_LICENSE_EXPIRED', 'Driver license is expired');
          }

          if (data.departureAt && data.returnAt) {
            const conflictingDriver = await tx.tourTransportAssignment.findFirst({
              where: {
                driverId: data.driverId,
                status: 'ASSIGNED',
                departureAt: { lt: data.returnAt },
                returnAt: { gt: data.departureAt }
              }
            });
            if (conflictingDriver) throw new AppError(409, 'RESOURCE_CONFLICT', 'Driver is already assigned during this period');
          }
        }

        // 4. Create Assignment
        const newAssignment = await tx.tourTransportAssignment.create({
          data: {
            organizationId,
            tourScheduleId: scheduleId,
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            departureAt: data.departureAt,
            returnAt: data.returnAt,
            seatCapacity: data.seatCapacity,
            notes: data.notes
          }
        });

        return newAssignment;
      });

      sendResponse(res, 201, true, 'Transport assigned successfully', assignment);
    } catch (error) { next(error); }
  }

  static async listTransportAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await prisma.tourTransportAssignment.findMany({
        where: { tourScheduleId: req.params.scheduleId, organizationId: req.tenant!.organizationId },
        include: { vehicle: true, driver: true }
      });
      sendResponse(res, 200, true, 'Transport assignments retrieved', assignments);
    } catch (error) { next(error); }
  }
}
