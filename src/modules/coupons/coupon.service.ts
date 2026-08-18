import { prisma } from '../../config/database';
import { Coupon, CouponDiscountType, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class CouponService {
  static async createCoupon(data: {
    code: string;
    name: string;
    description?: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maxDiscount?: number;
    minimumOrderValue?: number;
    maximumOrderValue?: number;
    usageLimit?: number;
    usagePerCustomer?: number;
    startAt?: Date;
    endAt?: Date;
    isActive?: boolean;
    stackable?: boolean;
  }): Promise<Coupon> {
    const organizationId = getTenantId();

    const existing = await prisma.coupon.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Coupon code already exists');
    }

    return prisma.coupon.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async listCoupons(filters: { isActive?: boolean }): Promise<Coupon[]> {
    const organizationId = getTenantId();

    const where: Prisma.CouponWhereInput = {
      organizationId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    return prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { redemptions: true }
        }
      }
    });
  }

  static async validateCoupon(code: string, customerId: string, orderValue: number): Promise<{ valid: boolean; discountAmount: number; coupon: Coupon }> {
    const organizationId = getTenantId();

    const coupon = await prisma.coupon.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError(400, 'Invalid or inactive coupon code');
    }

    const now = new Date();
    if (coupon.startAt && coupon.startAt > now) {
      throw new AppError(400, 'Coupon is not yet valid');
    }
    if (coupon.endAt && coupon.endAt < now) {
      throw new AppError(400, 'Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError(400, 'Coupon usage limit has been reached');
    }

    if (coupon.minimumOrderValue && orderValue < Number(coupon.minimumOrderValue)) {
      throw new AppError(400, `Minimum order value of ${coupon.minimumOrderValue} required`);
    }

    if (coupon.maximumOrderValue && orderValue > Number(coupon.maximumOrderValue)) {
      throw new AppError(400, `Maximum order value is ${coupon.maximumOrderValue}`);
    }

    // Check usage per customer
    if (coupon.usagePerCustomer) {
      const customerRedemptions = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          customerId,
        },
      });

      if (customerRedemptions >= coupon.usagePerCustomer) {
        throw new AppError(400, 'You have reached the usage limit for this coupon');
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === CouponDiscountType.FIXED_AMOUNT) {
      discountAmount = Number(coupon.discountValue);
    } else if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discountAmount = (orderValue * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    }

    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    return { valid: true, discountAmount, coupon };
  }

  // Example of redemption using a transaction
  static async redeemCoupon(couponId: string, customerId: string, bookingId: string, orderValue: number, tx: Prisma.TransactionClient): Promise<number> {
    // In a real flow, this would be part of the Booking transaction
    const coupon = await tx.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) throw new AppError(404, 'Coupon not found');
    
    const { discountAmount } = await this.validateCoupon(coupon.code, customerId, orderValue); // using read-only logic

    await tx.couponRedemption.create({
      data: {
        couponId,
        customerId,
        bookingId,
        discountAmount,
      },
    });

    await tx.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return discountAmount;
  }
}
