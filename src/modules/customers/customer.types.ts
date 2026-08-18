import { z } from 'zod';
import * as validation from './customer.validation';
import { Customer } from '@prisma/client';

export type ListCustomersQuery = z.infer<typeof validation.listCustomersSchema>['query'];
export type CreateCustomerInput = z.infer<typeof validation.createCustomerSchema>['body'];
export type UpdateCustomerInput = z.infer<typeof validation.updateCustomerSchema>['body'];

export interface CustomerSummary extends Customer {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalSpent: number;
}
