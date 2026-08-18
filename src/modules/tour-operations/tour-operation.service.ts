import { Prisma, TourOperationStatus, ChecklistCategory } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class TourOperationService {
  static async getOrCreateOperation(organizationId: string, tourScheduleId: string) {
    let operation = await prisma.tourOperation.findUnique({
      where: { tourScheduleId },
      include: { checklists: { include: { items: true } } },
    });

    if (!operation) {
      operation = await prisma.$transaction(async (tx) => {
        const schedule = await tx.tourSchedule.findUnique({
          where: { id: tourScheduleId, organizationId },
        });
        if (!schedule) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Tour schedule not found');

        const opCode = `OP-${Date.now().toString().slice(-6)}-${schedule.id.slice(0, 4)}`.toUpperCase();

        const newOp = await tx.tourOperation.create({
          data: {
            organizationId,
            tourScheduleId,
            operationCode: opCode,
            status: 'DRAFT',
            plannedDepartureAt: schedule.startDate,
            plannedReturnAt: schedule.endDate,
          },
          include: { checklists: { include: { items: true } } },
        });

        // Initialize default checklists
        const categories: ChecklistCategory[] = ['TRANSPORT', 'TRAVELERS', 'HOTEL', 'GUIDE', 'FINANCE'];
        for (const cat of categories) {
          await tx.operationalChecklist.create({
            data: {
              organizationId,
              tourOperationId: newOp.id,
              category: cat,
              items: {
                create: [{ title: `Verify ${cat.toLowerCase()} details`, isRequired: true }],
              },
            },
          });
        }

        return newOp;
      });
    }

    return operation;
  }

  static async changeStatus(organizationId: string, operationId: string, newStatus: TourOperationStatus, userId: string) {
    return prisma.$transaction(async (tx) => {
      const op = await tx.tourOperation.findUnique({ where: { id: operationId, organizationId } });
      if (!op) throw new AppError(404, 'OPERATION_NOT_FOUND', 'Operation not found');

      // Basic Transition Validation (simplified for brevity, a real state machine would be better)
      const validTransitions: Record<TourOperationStatus, TourOperationStatus[]> = {
        DRAFT: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['DEPARTED', 'PREPARING', 'CANCELLED'],
        DEPARTED: ['IN_PROGRESS'],
        IN_PROGRESS: ['RETURNING'],
        RETURNING: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      };

      if (!validTransitions[op.status].includes(newStatus)) {
        throw new AppError(400, 'INVALID_STATUS_TRANSITION', `Cannot transition from ${op.status} to ${newStatus}`);
      }

      // If moving to READY, check readiness
      if (newStatus === 'READY') {
        const readiness = await this.checkReadiness(organizationId, op.tourScheduleId);
        if (!readiness.ready) {
          throw new AppError(400, 'TOUR_NOT_READY', 'Tour is not ready for departure', readiness.checks);
        }
      }

      const updateData: Prisma.TourOperationUpdateInput = { status: newStatus, updatedBy: userId };
      if (newStatus === 'DEPARTED') updateData.actualDepartureAt = new Date();
      if (newStatus === 'COMPLETED') updateData.actualReturnAt = new Date();

      const updated = await tx.tourOperation.update({
        where: { id: operationId },
        data: updateData,
      });

      // Audit could be added here
      return updated;
    });
  }

  static async checkReadiness(organizationId: string, tourScheduleId: string) {
    const op = await prisma.tourOperation.findUnique({
      where: { tourScheduleId },
      include: { checklists: { include: { items: true } } },
    });

    const checks = [];
    let ready = true;

    if (!op) return { ready: false, checks: [{ key: 'operation', status: 'MISSING' }] };

    // 1. Checklists must be complete
    const incompleteItems = op.checklists.flatMap(c => c.items).filter(i => i.isRequired && !i.isCompleted);
    if (incompleteItems.length > 0) {
      ready = false;
      checks.push({ key: 'checklists', status: 'INCOMPLETE', details: `${incompleteItems.length} required items pending` });
    } else {
      checks.push({ key: 'checklists', status: 'READY' });
    }

    // 2. Transport capacity vs travelers
    const confirmedTravelers = await prisma.bookingTraveler.count({
      where: {
        booking: { tourScheduleId, status: 'CONFIRMED' },
        operationalStatus: { not: 'CANCELLED' }
      }
    });

    const transports = await prisma.tourTransportAssignment.findMany({
      where: { tourScheduleId, status: 'ASSIGNED' }
    });
    
    const transportCapacity = transports.reduce((acc, t) => acc + t.seatCapacity, 0);
    
    if (transportCapacity < confirmedTravelers) {
      ready = false;
      checks.push({ key: 'transport_capacity', status: 'INSUFFICIENT', details: `Capacity: ${transportCapacity}, Travelers: ${confirmedTravelers}` });
    } else {
      checks.push({ key: 'transport_capacity', status: 'READY' });
    }

    return { ready, checks };
  }
}
