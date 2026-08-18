import { AppError } from '../../utils/app-error';
import { BookingStatus } from '@prisma/client';

export class BookingStateMachine {
  private static readonly VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    PENDING: ['HELD', 'AWAITING_PAYMENT', 'CANCELLED'],
    HELD: ['AWAITING_PAYMENT', 'CONFIRMED', 'EXPIRED', 'CANCELLED'],
    AWAITING_PAYMENT: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
    CANCELLED: [],
    EXPIRED: [],
    COMPLETED: [],
    NO_SHOW: [],
  };

  static assertTransition(currentStatus: BookingStatus, newStatus: BookingStatus) {
    if (currentStatus === newStatus) return; // No-op allowed
    const allowed = this.VALID_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new AppError(400, 'INVALID_STATUS_TRANSITION', `Cannot transition booking from ${currentStatus} to ${newStatus}`);
    }
  }
}
