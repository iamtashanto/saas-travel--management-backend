import { z } from 'zod';
import * as validation from './booking.validation';

export type ListBookingsQuery = z.infer<typeof validation.listBookingsSchema>['query'];
export type CreateBookingInput = z.infer<typeof validation.createBookingSchema>['body'];
export type UpdateBookingStatusInput = z.infer<typeof validation.updateBookingStatusSchema>['body'];

export type PublicCreateBookingInput = z.infer<typeof validation.publicCreateBookingSchema>['body'];
export type PublicBookingLookupInput = z.infer<typeof validation.publicBookingLookupSchema>['body'];
