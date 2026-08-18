import { PrismaClient, TourAddon, TourPackage, TourSchedule } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';
import { Decimal } from '@prisma/client/runtime/library';

export interface PricingTravelerInput {
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

export interface PricingAddonInput {
  tourAddonId: string;
  quantity: number;
}

export interface CalculatePricingInput {
  organizationId: string;
  tourPackageId: string;
  tourScheduleId: string;
  travelers: PricingTravelerInput[];
  addons?: PricingAddonInput[];
}

export class BookingPricingService {
  /**
   * Calculates pricing dynamically based on current DB values.
   * Does NOT mutate state.
   */
  static async calculatePricing(input: CalculatePricingInput) {
    const { organizationId, tourPackageId, tourScheduleId, travelers, addons = [] } = input;

    // Fetch schedule and package pricing
    const schedule = await prisma.tourSchedule.findUnique({
      where: { id: tourScheduleId, organizationId, tourPackageId },
      include: { tourPackage: true },
    });

    if (!schedule) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Tour schedule not found');

    // Use schedule overrides if present, fallback to package defaults
    const adultPrice = new Decimal(schedule.adultPrice ?? schedule.tourPackage.basePrice);
    const childPrice = new Decimal(schedule.childPrice ?? schedule.tourPackage.childPrice ?? adultPrice);
    const infantPrice = new Decimal(schedule.infantPrice ?? schedule.tourPackage.infantPrice ?? 0);

    const currency = schedule.tourPackage.currency;

    let adultCount = 0;
    let childCount = 0;
    let infantCount = 0;

    let subtotal = new Decimal(0);

    // 1. Calculate Traveler Prices
    for (const traveler of travelers) {
      if (traveler.type === 'ADULT') {
        adultCount++;
        subtotal = subtotal.add(adultPrice);
      } else if (traveler.type === 'CHILD') {
        childCount++;
        subtotal = subtotal.add(childPrice);
      } else if (traveler.type === 'INFANT') {
        infantCount++;
        subtotal = subtotal.add(infantPrice);
      }
    }

    // 2. Calculate Addon Prices
    let addonAmount = new Decimal(0);
    const addonDetails: { addon: TourAddon; quantity: number; unitPrice: Decimal; totalPrice: Decimal }[] = [];

    if (addons.length > 0) {
      const addonIds = addons.map((a) => a.tourAddonId);
      const dbAddons = await prisma.tourAddon.findMany({
        where: { id: { in: addonIds }, organizationId, tourPackageId },
      });

      for (const reqAddon of addons) {
        const dbAddon = dbAddons.find((a) => a.id === reqAddon.tourAddonId);
        if (!dbAddon) throw new AppError(400, 'ADDON_INVALID', `Addon ${reqAddon.tourAddonId} not found or invalid for this package`);
        
        const unitPrice = new Decimal(dbAddon.price);
        const totalPrice = unitPrice.mul(reqAddon.quantity);
        addonAmount = addonAmount.add(totalPrice);
        
        addonDetails.push({
          addon: dbAddon,
          quantity: reqAddon.quantity,
          unitPrice,
          totalPrice,
        });
      }
    }

    // 3. Compute Totals
    const totalAmount = subtotal.add(addonAmount); // Fees and discounts can be added here later

    return {
      pricing: {
        adultPrice,
        childPrice,
        infantPrice,
        currency,
      },
      counts: {
        adultCount,
        childCount,
        infantCount,
        travelerCount: travelers.length,
      },
      totals: {
        subtotal,
        addonAmount,
        discountAmount: new Decimal(0),
        feeAmount: new Decimal(0),
        totalAmount,
      },
      addonDetails,
    };
  }
}
