import { Prisma, CustomerStatus, PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from './customer.types';

export class CustomerRepository {
  static async findCustomers(organizationId: string, query: ListCustomersQuery) {
    const { page, limit, search, phone, email, status, city, district, createdFrom, createdTo, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      status: status ? status : { not: 'INACTIVE' },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (phone) where.phone = { contains: phone };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort === 'totalSpent' ? { createdAt: 'desc' } : { [sort]: order },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async findCustomerById(id: string, organizationId: string) {
    return prisma.customer.findUnique({
      where: { id, organizationId },
    });
  }

  static async findCustomerByPhone(phone: string, organizationId: string) {
    return prisma.customer.findFirst({
      where: { normalizedPhone: phone, organizationId },
    });
  }

  static async createCustomer(organizationId: string, data: CreateCustomerInput, normalizedPhone: string | null, createdBy?: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.customer.create({
      data: {
        organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || `${data.firstName} ${data.lastName || ''}`.trim(),
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone,
        normalizedPhone,
        whatsappPhone: data.whatsappPhone,
        countryCode: data.countryCode,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        address: data.address,
        city: data.city,
        district: data.district,
        country: data.country,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        notes: data.notes,
        createdBy,
        updatedBy: createdBy,
      },
    });
  }

  static async updateCustomer(id: string, organizationId: string, data: UpdateCustomerInput, normalizedPhone: string | null, updatedBy?: string) {
    const updateData: Prisma.CustomerUpdateInput = {
      updatedBy,
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.email !== undefined) updateData.email = data.email ? data.email.toLowerCase() : null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (normalizedPhone !== undefined) updateData.normalizedPhone = normalizedPhone;
    if (data.whatsappPhone !== undefined) updateData.whatsappPhone = data.whatsappPhone;
    if (data.countryCode !== undefined) updateData.countryCode = data.countryCode;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.emergencyContactName !== undefined) updateData.emergencyContactName = data.emergencyContactName;
    if (data.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = data.emergencyContactPhone;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.customer.update({
      where: { id, organizationId },
      data: updateData,
    });
  }

  static async getCustomerBookingStats(id: string, organizationId: string) {
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      where: { customerId: id, organizationId },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    let totalBookings = 0;
    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let completedBookings = 0;
    let totalSpent = 0;

    for (const stat of stats) {
      totalBookings += stat._count.id;
      if (stat.status === 'CONFIRMED') {
        confirmedBookings += stat._count.id;
        totalSpent += stat._sum.totalAmount ? Number(stat._sum.totalAmount) : 0;
      }
      if (stat.status === 'CANCELLED') cancelledBookings += stat._count.id;
      if (stat.status === 'COMPLETED') {
        completedBookings += stat._count.id;
        totalSpent += stat._sum.totalAmount ? Number(stat._sum.totalAmount) : 0;
      }
    }

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalSpent,
    };
  }

  static async getCustomerRecentBookings(id: string, organizationId: string, limit = 5) {
    const bookings = await prisma.booking.findMany({
      where: { customerId: id, organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tourPackage: { select: { title: true } },
        tourSchedule: { select: { startDate: true } },
      },
    });

    return bookings.map(b => ({
      ...b,
      subtotal: b.subtotal.toNumber(),
      totalAmount: b.totalAmount.toNumber(),
      paidAmount: b.paidAmount.toNumber(),
      dueAmount: b.dueAmount.toNumber(),
      discountAmount: b.discountAmount.toNumber(),
      addonAmount: b.addonAmount.toNumber(),
      feeAmount: b.feeAmount.toNumber(),
    }));
  }
}
