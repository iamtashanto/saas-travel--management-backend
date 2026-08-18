import { prisma } from '../../config/database';
import { Promotion, PromotionType, CategoryStatus, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class PromotionService {
  static async createPromotion(data: {
    name: string;
    slug: string;
    title: string;
    description?: string;
    promotionType: PromotionType;
    startAt?: Date;
    endAt?: Date;
    status?: CategoryStatus;
    bannerImage?: string;
    landingUrl?: string;
    priority?: number;
    isFeatured?: boolean;
  }): Promise<Promotion> {
    const organizationId = getTenantId();

    const existing = await prisma.promotion.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug: data.slug,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Promotion with this slug already exists');
    }

    return prisma.promotion.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async listPromotions(filters: {
    status?: CategoryStatus;
    isFeatured?: boolean;
  }): Promise<Promotion[]> {
    const organizationId = getTenantId();

    const where: Prisma.PromotionWhereInput = {
      organizationId,
      ...(filters.status && { status: filters.status }),
      ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
    };

    return prisma.promotion.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async updatePromotion(
    id: string,
    data: {
      name?: string;
      title?: string;
      description?: string;
      status?: CategoryStatus;
      bannerImage?: string;
      landingUrl?: string;
      priority?: number;
      isFeatured?: boolean;
    }
  ): Promise<Promotion> {
    const organizationId = getTenantId();
    const promotion = await prisma.promotion.findUnique({ where: { id } });

    if (!promotion || promotion.organizationId !== organizationId) {
      throw new AppError(404, 'Promotion not found');
    }

    return prisma.promotion.update({
      where: { id },
      data,
    });
  }
}
