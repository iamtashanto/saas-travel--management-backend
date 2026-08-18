import { CustomerRepository } from './customer.repository';
import { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from './customer.types';
import { AppError } from '../../utils/app-error';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class CustomerService {
  private static normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    // Basic normalization: remove non-numeric characters
    return phone.replace(/\D/g, '');
  }

  static async listCustomers(organizationId: string, query: ListCustomersQuery) {
    return CustomerRepository.findCustomers(organizationId, query);
  }

  static async getCustomerById(id: string, organizationId: string) {
    const customer = await CustomerRepository.findCustomerById(id, organizationId);
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    const stats = await CustomerRepository.getCustomerBookingStats(id, organizationId);
    const recentBookings = await CustomerRepository.getCustomerRecentBookings(id, organizationId);

    return {
      ...customer,
      stats,
      recentBookings,
    };
  }

  static async createCustomer(organizationId: string, data: CreateCustomerInput, actorUserId?: string, tx?: Prisma.TransactionClient) {
    const normalizedPhone = this.normalizePhone(data.phone);
    if (normalizedPhone) {
      const existing = await CustomerRepository.findCustomerByPhone(normalizedPhone, organizationId);
      if (existing) {
        throw new AppError(409, 'CUSTOMER_DUPLICATE', 'A customer with this phone number already exists.');
      }
    }

    const customer = await CustomerRepository.createCustomer(organizationId, data, normalizedPhone, actorUserId, tx);

    if (!tx) {
      await AuditLogService.log(organizationId, actorUserId || 'system', 'CUSTOMER_CREATE', 'Customer', customer.id, { customer });
    }

    return customer;
  }

  static async updateCustomer(id: string, organizationId: string, data: UpdateCustomerInput, actorUserId?: string) {
    const customer = await CustomerRepository.findCustomerById(id, organizationId);
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');

    let normalizedPhone: string | null = undefined as any;
    if (data.phone !== undefined) {
      normalizedPhone = this.normalizePhone(data.phone);
      if (normalizedPhone && normalizedPhone !== customer.normalizedPhone) {
        const existing = await CustomerRepository.findCustomerByPhone(normalizedPhone, organizationId);
        if (existing) {
          throw new AppError(409, 'CUSTOMER_DUPLICATE', 'A customer with this phone number already exists.');
        }
      }
    }

    const updated = await CustomerRepository.updateCustomer(id, organizationId, data, normalizedPhone, actorUserId);
    await AuditLogService.log(organizationId, actorUserId || 'system', 'CUSTOMER_UPDATE', 'Customer', updated.id, { data, oldStatus: customer.status, newStatus: updated.status });
    return updated;
  }

  static async blockCustomer(id: string, organizationId: string, actorUserId: string) {
    return this.updateCustomer(id, organizationId, { status: 'BLOCKED' }, actorUserId);
  }

  static async archiveCustomer(id: string, organizationId: string, actorUserId: string) {
    return this.updateCustomer(id, organizationId, { status: 'INACTIVE' }, actorUserId);
  }

  static async mergeCustomers(organizationId: string, sourceId: string, targetId: string, actorUserId: string) {
    if (sourceId === targetId) throw new AppError(400, 'MERGE_ERROR', 'Cannot merge customer into itself');

    const source = await CustomerRepository.findCustomerById(sourceId, organizationId);
    const target = await CustomerRepository.findCustomerById(targetId, organizationId);

    if (!source || !target) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Source or target customer not found');

    await prisma.$transaction(async (tx) => {
      // Move bookings
      await tx.booking.updateMany({
        where: { customerId: sourceId, organizationId },
        data: { customerId: targetId },
      });

      // Move travelers
      await tx.traveler.updateMany({
        where: { customerId: sourceId, organizationId },
        data: { customerId: targetId },
      });

      // Archive source
      await tx.customer.update({
        where: { id: sourceId },
        data: { status: 'INACTIVE', notes: `Merged into ${targetId}. ${source.notes || ''}` },
      });
    });

    await AuditLogService.log(organizationId, actorUserId, 'CUSTOMER_MERGED', 'Customer', targetId, { sourceId, targetId });
    return { success: true, message: 'Customers merged successfully' };
  }
}
