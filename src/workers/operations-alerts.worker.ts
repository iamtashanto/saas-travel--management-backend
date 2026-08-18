import { prisma } from '../lib/prisma';
import { logger } from '../common/utils/logger';

export class OperationsAlertsWorker {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  static start(intervalMs = 12 * 60 * 60 * 1000) { // Default: Every 12 hours
    if (this.timer) return;

    logger.info(`Starting OperationsAlertsWorker with interval ${intervalMs}ms`);

    // Run immediately on start
    this.runChecks();

    this.timer = setInterval(() => this.runChecks(), intervalMs);
  }

  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped OperationsAlertsWorker');
    }
  }

  private static async runChecks() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      await this.checkDriverLicenses();
      await this.checkTourReadiness();
    } catch (error) {
      logger.error(error, 'Error in OperationsAlertsWorker');
    } finally {
      this.isRunning = false;
    }
  }

  private static async checkDriverLicenses() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringDrivers = await prisma.driver.findMany({
      where: {
        isActive: true,
        licenseExpiryDate: { lte: thirtyDaysFromNow, gt: new Date() }
      }
    });

    if (expiringDrivers.length > 0) {
      logger.warn(`Found ${expiringDrivers.length} drivers with licenses expiring within 30 days.`);
      // In a real app, integrate with email/SMS notification service here
      for (const d of expiringDrivers) {
        logger.info(`Alert: Driver ${d.name} (${d.licenseNumber}) license expires on ${d.licenseExpiryDate.toISOString()}`);
      }
    }
  }

  private static async checkTourReadiness() {
    const fortyEightHoursFromNow = new Date();
    fortyEightHoursFromNow.setHours(fortyEightHoursFromNow.getHours() + 48);

    const upcomingTours = await prisma.tourSchedule.findMany({
      where: {
        startDate: { lte: fortyEightHoursFromNow, gt: new Date() },
        status: 'PUBLISHED',
        tourOperation: { status: { notIn: ['READY', 'DEPARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } }
      },
      include: { tourOperation: true }
    });

    if (upcomingTours.length > 0) {
      logger.warn(`Found ${upcomingTours.length} upcoming tours within 48h that are NOT READY.`);
      // E.g. send an alert to the ops manager
      for (const t of upcomingTours) {
        logger.info(`Alert: Tour Schedule ${t.id} departs at ${t.startDate.toISOString()} and is currently in status ${t.tourOperation?.status || 'DRAFT'}`);
      }
    }
  }
}
