import { z } from 'zod';

export const driverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  alternatePhone: z.string().optional(),
  licenseNumber: z.string().min(1),
  licenseType: z.string().optional(),
  licenseExpiryDate: z.string().datetime(),
  experienceYears: z.number().int().min(0).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'ON_LEAVE', 'INACTIVE']).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const driverDutyLogSchema = z.object({
  tourScheduleId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  startOdometer: z.number().int().optional(),
  endOdometer: z.number().int().optional(),
  notes: z.string().optional(),
});
