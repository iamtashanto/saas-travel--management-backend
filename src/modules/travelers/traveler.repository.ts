import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateTravelerInput, ListTravelersQuery, UpdateTravelerInput } from './traveler.types';

export class TravelerRepository {
  static async findTravelers(organizationId: string, query: ListTravelersQuery) {
    const { page, limit, search, customerId, phone, email } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TravelerWhereInput = {
      organizationId,
      status: 'ACTIVE',
    };

    if (customerId) where.customerId = customerId;
    if (phone) where.phone = { contains: phone };
    if (email) where.email = { contains: email, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.traveler.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.traveler.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async findTravelerById(id: string, organizationId: string) {
    return prisma.traveler.findUnique({
      where: { id, organizationId },
    });
  }

  static async createTraveler(organizationId: string, data: CreateTravelerInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.traveler.create({
      data: {
        organizationId,
        customerId: data.customerId,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || `${data.firstName} ${data.lastName || ''}`.trim(),
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        nationality: data.nationality,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        specialRequirements: data.specialRequirements,
        notes: data.notes,
      },
    });
  }

  static async updateTraveler(id: string, organizationId: string, data: UpdateTravelerInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;

    const updateData: Prisma.TravelerUpdateInput = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.email !== undefined) updateData.email = data.email ? data.email.toLowerCase() : null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.emergencyContactName !== undefined) updateData.emergencyContactName = data.emergencyContactName;
    if (data.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = data.emergencyContactPhone;
    if (data.specialRequirements !== undefined) updateData.specialRequirements = data.specialRequirements;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return db.traveler.update({
      where: { id, organizationId },
      data: updateData,
    });
  }

  static async deleteTraveler(id: string, organizationId: string) {
    return prisma.traveler.delete({
      where: { id, organizationId },
    });
  }
}
