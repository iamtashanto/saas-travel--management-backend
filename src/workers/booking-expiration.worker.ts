import { BookingService } from '../modules/bookings/booking.service';
import { logger } from '../common/utils/logger';

export class BookingExpirationWorker {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  static start(intervalMs = 60000) {
    if (this.timer) return;

    logger.info(`Starting BookingExpirationWorker with interval ${intervalMs}ms`);

    this.timer = setInterval(async () => {
      if (this.isRunning) return; // Prevent overlapping runs
      this.isRunning = true;

      try {
        await BookingService.expireBookingHolds();
      } catch (error) {
        logger.error(error, 'Error in BookingExpirationWorker');
      } finally {
        this.isRunning = false;
      }
    }, intervalMs);
  }

  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Stopped BookingExpirationWorker');
    }
  }
}
