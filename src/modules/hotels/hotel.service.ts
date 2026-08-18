import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { Prisma } from '@prisma/client';

export class HotelService {
  static async listHotels(organizationId: string, page: number, limit: number, search?: string, city?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.HotelWhereInput = { organizationId, isActive: true };
    if (city) where.city = city;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.hotel.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.hotel.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  static async getHotel(id: string, organizationId: string) {
    const hotel = await prisma.hotel.findFirst({
      where: { id, organizationId },
      include: {
        roomTypes: true,
      }
    });
    if (!hotel) throw new AppError(404, 'NOT_FOUND', 'Hotel not found');
    return hotel;
  }

  static async createHotel(organizationId: string, data: any) {
    return prisma.hotel.create({
      data: { ...data, organizationId },
    });
  }

  static async updateHotel(id: string, organizationId: string, data: any) {
    await this.getHotel(id, organizationId);
    return prisma.hotel.update({
      where: { id },
      data,
    });
  }

  static async deleteHotel(id: string, organizationId: string) {
    await this.getHotel(id, organizationId);
    return prisma.hotel.update({
      where: { id },
      data: { isActive: false, status: 'INACTIVE' },
    });
  }

  // Extensions
  static async addRoomType(hotelId: string, organizationId: string, data: any) {
    await this.getHotel(hotelId, organizationId);
    return prisma.hotelRoomType.create({
      data: { ...data, hotelId, organizationId },
    });
  }
}
