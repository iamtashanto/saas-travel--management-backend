import { z } from 'zod';

export const vehicleSchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().min(1),
  type: z.enum(['BUS', 'MICROBUS', 'CAR', 'BOAT', 'LAUNCH', 'OTHER']),
  capacity: z.number().int().positive(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'ON_LEAVE', 'INACTIVE']).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  manufactureYear: z.number().int().optional(),
  currentMileage: z.number().int().optional(),
  fuelType: z.string().optional(),
  ownerType: z.enum(['COMPANY', 'VENDOR', 'LEASED', 'OTHER']).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const vehicleDocumentSchema = z.object({
  documentType: z.string().min(1),
  documentNumber: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  fileUrl: z.string().url().optional(),
  status: z.string().optional(),
});

export const vehicleTripLogSchema = z.object({
  tourScheduleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  tripStart: z.string().datetime(),
  tripEnd: z.string().datetime().optional(),
  startOdometer: z.number().int().optional(),
  endOdometer: z.number().int().optional(),
  fuelConsumed: z.number().optional(),
  route: z.string().optional(),
});

export const vehicleFuelRecordSchema = z.object({
  vendorId: z.string().uuid().optional(),
  date: z.string().datetime(),
  liters: z.number().positive(),
  pricePerLiter: z.number().positive(),
  totalCost: z.number().positive(),
  odometer: z.number().int().optional(),
  receiptUrl: z.string().url().optional(),
});

export const vehicleMaintenanceSchema = z.object({
  maintenanceType: z.string().min(1),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  date: z.string().datetime(),
  nextMaintenanceDate: z.string().datetime().optional(),
  odometer: z.number().int().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const vehicleRentalSchema = z.object({
  vendorId: z.string().uuid(),
  rentalStart: z.string().datetime(),
  rentalEnd: z.string().datetime(),
  rate: z.number().min(0),
  deposit: z.number().min(0).optional(),
  terms: z.string().optional(),
});
