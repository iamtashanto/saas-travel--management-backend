import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';

export class TourManifestController {
  static async generateManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const organizationId = req.tenant!.organizationId;

      // 1. Fetch Tour Schedule Data
      const schedule = await prisma.tourSchedule.findUnique({
        where: { id: scheduleId, organizationId },
        include: {
          tourPackage: true,
          tourOperation: true,
        }
      });

      if (!schedule) throw new AppError(404, 'NOT_FOUND', 'Schedule not found');

      // 2. Fetch Travelers
      const travelers = await prisma.bookingTraveler.findMany({
        where: { booking: { tourScheduleId: scheduleId, organizationId, status: 'CONFIRMED' } },
        include: { traveler: true, pickupPoint: true, booking: { select: { bookingReference: true } } }
      });

      // 3. Fetch Transport
      const transports = await prisma.tourTransportAssignment.findMany({
        where: { tourScheduleId: scheduleId, organizationId },
        include: { vehicle: true, driver: true }
      });

      // 4. Fetch Guides
      const guides = await prisma.tourGuideAssignment.findMany({
        where: { tourScheduleId: scheduleId, organizationId },
        include: { guide: true }
      });

      // 5. Build JSON Manifest
      const manifestData = {
        generatedAt: new Date(),
        tour: {
          title: schedule.tourPackage.title,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          operationStatus: schedule.tourOperation?.status || 'UNKNOWN',
        },
        travelers: travelers.map((t, idx) => ({
          sl: idx + 1,
          name: `${t.firstName} ${t.lastName || ''}`.trim(),
          phone: t.phone || t.traveler.phone,
          bookingRef: t.booking.bookingReference,
          pickup: t.pickupPoint?.name || 'Not assigned',
          status: t.operationalStatus,
          specialRequirement: t.specialRequirement,
        })),
        transport: transports.map(t => ({
          vehicle: t.vehicle.registrationNumber,
          driver: t.driver?.name || 'Unassigned',
          departureAt: t.departureAt,
        })),
        guides: guides.map(g => ({
          name: g.guide.name,
          role: g.role,
        })),
      };

      // 6. Save Versioned Snapshot
      const latestVersion = await prisma.manifestVersion.findFirst({
        where: { tourScheduleId: scheduleId, organizationId },
        orderBy: { version: 'desc' }
      });

      const nextVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

      const manifestSnapshot = await prisma.manifestVersion.create({
        data: {
          organizationId,
          tourScheduleId: scheduleId,
          version: nextVersionNumber,
          dataSnapshot: manifestData as any,
          status: 'DRAFT',
          generatedBy: req.user!.userId,
        }
      });

      sendResponse(res, 201, true, 'Manifest generated', manifestSnapshot);
    } catch (error) { next(error); }
  }

  static async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.params;
      const organizationId = req.tenant!.organizationId;

      const versions = await prisma.manifestVersion.findMany({
        where: { tourScheduleId: scheduleId, organizationId },
        orderBy: { version: 'desc' },
        select: { id: true, version: true, status: true, generatedAt: true, generatedBy: true }
      });

      sendResponse(res, 200, true, 'Manifest versions retrieved', versions);
    } catch (error) { next(error); }
  }

  static async getManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const manifest = await prisma.manifestVersion.findFirst({
        where: { id, organizationId }
      });

      if (!manifest) throw new AppError(404, 'NOT_FOUND', 'Manifest not found');

      sendResponse(res, 200, true, 'Manifest retrieved', manifest);
    } catch (error) { next(error); }
  }

  static async finalizeManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizationId = req.tenant!.organizationId;

      const updated = await prisma.manifestVersion.updateMany({
        where: { id, organizationId },
        data: { status: 'FINAL' }
      });

      sendResponse(res, 200, true, 'Manifest finalized', updated);
    } catch (error) { next(error); }
  }
}
