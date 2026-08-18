import { prisma } from '../../config/database';
import { ReferralCode, Referral, ReferralStatus, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class ReferralService {
  static async createReferralCode(data: {
    customerId: string;
    code: string;
    usageLimit?: number;
    startAt?: Date;
    endAt?: Date;
  }): Promise<ReferralCode> {
    const organizationId = getTenantId();

    const existingCustomerCode = await prisma.referralCode.findUnique({
      where: { customerId: data.customerId },
    });

    if (existingCustomerCode) {
      throw new AppError(400, 'Customer already has a referral code');
    }

    const existingCode = await prisma.referralCode.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: data.code,
        },
      },
    });

    if (existingCode) {
      throw new AppError(400, 'This referral code is already in use');
    }

    return prisma.referralCode.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async getReferralCodeByCustomer(customerId: string): Promise<ReferralCode> {
    const organizationId = getTenantId();
    
    const code = await prisma.referralCode.findUnique({
      where: { customerId },
    });

    if (!code || code.organizationId !== organizationId) {
      throw new AppError(404, 'Referral code not found');
    }

    return code;
  }

  static async recordReferral(code: string, referredId: string): Promise<Referral> {
    const organizationId = getTenantId();

    const referralCode = await prisma.referralCode.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (!referralCode || referralCode.status !== 'ACTIVE') {
      throw new AppError(400, 'Invalid or inactive referral code');
    }

    if (referralCode.customerId === referredId) {
      throw new AppError(400, 'You cannot refer yourself');
    }

    const now = new Date();
    if (referralCode.startAt && referralCode.startAt > now) {
      throw new AppError(400, 'Referral code is not yet valid');
    }
    if (referralCode.endAt && referralCode.endAt < now) {
      throw new AppError(400, 'Referral code has expired');
    }

    if (referralCode.usageLimit && referralCode.usageCount >= referralCode.usageLimit) {
      throw new AppError(400, 'Referral code usage limit reached');
    }

    const existingReferral = await prisma.referral.findUnique({
      where: { referredId },
    });

    if (existingReferral) {
      throw new AppError(400, 'Customer has already been referred');
    }

    return prisma.$transaction(async (tx) => {
      const newReferral = await tx.referral.create({
        data: {
          organizationId,
          referrerId: referralCode.customerId,
          referredId,
          referralCode: code,
          status: ReferralStatus.CLICKED,
        },
      });

      await tx.referralCode.update({
        where: { id: referralCode.id },
        data: { usageCount: { increment: 1 } },
      });

      return newReferral;
    });
  }

  static async updateReferralStatus(id: string, status: ReferralStatus): Promise<Referral> {
    const organizationId = getTenantId();

    const referral = await prisma.referral.findUnique({
      where: { id },
    });

    if (!referral || referral.organizationId !== organizationId) {
      throw new AppError(404, 'Referral not found');
    }

    return prisma.referral.update({
      where: { id },
      data: {
        status,
        ...(status === ReferralStatus.QUALIFIED && !referral.qualifiedAt && { qualifiedAt: new Date() }),
        ...(status === ReferralStatus.REWARDED && !referral.rewardedAt && { rewardedAt: new Date() }),
      },
    });
  }
}
