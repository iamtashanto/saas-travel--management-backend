import { prisma } from '../../config/database';
import { MarketingCampaign, CampaignType, CampaignStatus, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class CampaignService {
  static async createCampaign(data: {
    name: string;
    code: string;
    description?: string;
    type: CampaignType;
    audienceType: string;
    startAt?: Date;
    endAt?: Date;
    budget?: number;
    status?: CampaignStatus;
    createdBy?: string;
  }): Promise<MarketingCampaign> {
    const organizationId = getTenantId();

    const existing = await prisma.marketingCampaign.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Campaign with this code already exists');
    }

    return prisma.marketingCampaign.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async listCampaigns(filters: {
    type?: CampaignType;
    status?: CampaignStatus;
  }): Promise<MarketingCampaign[]> {
    const organizationId = getTenantId();
    
    const where: Prisma.MarketingCampaignWhereInput = {
      organizationId,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
    };

    return prisma.marketingCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true, bookings: true }
        }
      }
    });
  }

  static async getCampaignById(id: string): Promise<MarketingCampaign> {
    const organizationId = getTenantId();
    
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipients: true, bookings: true }
        }
      }
    });

    if (!campaign || campaign.organizationId !== organizationId) {
      throw new AppError(404, 'Campaign not found');
    }

    return campaign;
  }

  static async updateCampaign(
    id: string,
    data: {
      name?: string;
      description?: string;
      startAt?: Date;
      endAt?: Date;
      budget?: number;
      status?: CampaignStatus;
    }
  ): Promise<MarketingCampaign> {
    const campaign = await this.getCampaignById(id);

    return prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data,
    });
  }

  static async addRecipients(campaignId: string, customerIds: string[], channel: string): Promise<{ count: number }> {
    const campaign = await this.getCampaignById(campaignId);
    const organizationId = getTenantId();

    if (campaign.status === CampaignStatus.COMPLETED || campaign.status === CampaignStatus.CANCELLED) {
      throw new AppError(400, 'Cannot add recipients to a completed or cancelled campaign');
    }

    const validCustomers = await prisma.customer.findMany({
      where: { id: { in: customerIds }, organizationId },
      select: { id: true },
    });

    const validCustomerIds = validCustomers.map(c => c.id);

    if (validCustomerIds.length === 0) {
      return { count: 0 };
    }

    const result = await prisma.campaignRecipient.createMany({
      data: validCustomerIds.map(customerId => ({
        campaignId: campaign.id,
        customerId,
        channel,
      })),
      skipDuplicates: true,
    });

    return { count: result.count };
  }
}
