import { z } from 'zod';

export const hotelSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'ON_LEAVE', 'INACTIVE']).optional(),
  isActive: z.boolean().optional(),
});

export const hotelRoomTypeSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  totalRooms: z.number().int().min(0).optional(),
  availableRooms: z.number().int().min(0).optional(),
  basePrice: z.number().min(0).optional(),
  description: z.string().optional(),
});
