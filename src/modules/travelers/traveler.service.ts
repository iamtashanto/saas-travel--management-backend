import { TravelerRepository } from './traveler.repository';
import { CreateTravelerInput, ListTravelersQuery, UpdateTravelerInput } from './traveler.types';
import { AppError } from '../../utils/app-error';
import { CustomerRepository } from '../customers/customer.repository';
import { AuditLogService } from '../audit-logs/audit-log.service';

export class TravelerService {
  static async listTravelers(organizationId: string, query: ListTravelersQuery) {
    return TravelerRepository.findTravelers(organizationId, query);
  }

  static async getTravelerById(id: string, organizationId: string) {
    const traveler = await TravelerRepository.findTravelerById(id, organizationId);
    if (!traveler) throw new AppError(404, 'TRAVELER_NOT_FOUND', 'Traveler not found');
    return traveler;
  }

  static async createTraveler(organizationId: string, data: CreateTravelerInput, actorUserId?: string) {
    const customer = await CustomerRepository.findCustomerById(data.customerId, organizationId);
    if (!customer) throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');

    const traveler = await TravelerRepository.createTraveler(organizationId, data);
    await AuditLogService.log(organizationId, actorUserId || 'system', 'TRAVELER_CREATE', 'Traveler', traveler.id, { traveler });
    return traveler;
  }

  static async updateTraveler(id: string, organizationId: string, data: UpdateTravelerInput, actorUserId?: string) {
    const traveler = await TravelerRepository.findTravelerById(id, organizationId);
    if (!traveler) throw new AppError(404, 'TRAVELER_NOT_FOUND', 'Traveler not found');

    const updated = await TravelerRepository.updateTraveler(id, organizationId, data);
    await AuditLogService.log(organizationId, actorUserId || 'system', 'TRAVELER_UPDATE', 'Traveler', updated.id, { data });
    return updated;
  }

  static async deleteTraveler(id: string, organizationId: string, actorUserId: string) {
    const traveler = await TravelerRepository.findTravelerById(id, organizationId);
    if (!traveler) throw new AppError(404, 'TRAVELER_NOT_FOUND', 'Traveler not found');

    await TravelerRepository.deleteTraveler(id, organizationId);
    await AuditLogService.log(organizationId, actorUserId, 'TRAVELER_DELETE', 'Traveler', id, { traveler });
    return { success: true };
  }
}
