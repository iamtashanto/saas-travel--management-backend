import { prisma } from '../../config/database';
import { LoyaltyAccount, LoyaltyTransactionType, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class LoyaltyService {
  static async getAccountByCustomerId(customerId: string): Promise<LoyaltyAccount> {
    const organizationId = getTenantId();
    
    let account = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });

    if (!account) {
      // Auto-create if it doesn't exist
      account = await prisma.loyaltyAccount.create({
        data: {
          organizationId,
          customerId,
        },
      });
    } else if (account.organizationId !== organizationId) {
      throw new AppError(403, 'Unauthorized access to loyalty account');
    }

    return account;
  }

  static async adjustBalance(accountId: string, data: {
    points: number;
    type: LoyaltyTransactionType;
    description?: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const organizationId = getTenantId();
    
    const account = await prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.organizationId !== organizationId) {
      throw new AppError(404, 'Loyalty account not found');
    }

    return prisma.$transaction(async (tx) => {
      let balanceChange = Number(data.points);
      
      // Calculate balance delta based on transaction type
      if (data.type === LoyaltyTransactionType.REDEEM || data.type === LoyaltyTransactionType.EXPIRE || (data.type === LoyaltyTransactionType.REVERSAL && data.points > 0)) {
        balanceChange = -Math.abs(balanceChange);
      } else if (data.type === LoyaltyTransactionType.EARN) {
        balanceChange = Math.abs(balanceChange);
      }

      if (Number(account.balance) + balanceChange < 0) {
        throw new AppError(400, 'Insufficient loyalty points balance');
      }

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId,
          ...data,
        },
      });

      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChange },
          ...(data.type === LoyaltyTransactionType.EARN && {
            lifetimeEarned: { increment: balanceChange },
          }),
          ...(data.type === LoyaltyTransactionType.REDEEM && {
            lifetimeRedeemed: { increment: Math.abs(balanceChange) },
          }),
        },
      });

      return { transaction, account: updatedAccount };
    });
  }

  static async getTransactionHistory(accountId: string) {
    const organizationId = getTenantId();
    
    const account = await prisma.loyaltyAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.organizationId !== organizationId) {
      throw new AppError(404, 'Loyalty account not found');
    }

    return prisma.loyaltyTransaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
