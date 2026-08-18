import { prisma } from '../../config/database';
import { CustomerSegment, SegmentType, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class SegmentService {
  static async createSegment(data: {
    name: string;
    code: string;
    description?: string;
    type?: SegmentType;
    rules?: any;
    isActive?: boolean;
  }): Promise<CustomerSegment> {
    const organizationId = getTenantId();

    const existing = await prisma.customerSegment.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new AppError(400, 'Segment with this code already exists');
    }

    return prisma.customerSegment.create({
      data: {
        ...data,
        organizationId,
        type: data.type || SegmentType.MANUAL,
      },
    });
  }

  static async listSegments(filters: {
    type?: SegmentType;
    isActive?: boolean;
  }): Promise<CustomerSegment[]> {
    const organizationId = getTenantId();
    
    const where: Prisma.CustomerSegmentWhereInput = {
      organizationId,
      ...(filters.type && { type: filters.type }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    return prisma.customerSegment.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async getSegmentById(id: string): Promise<CustomerSegment> {
    const organizationId = getTenantId();
    
    const segment = await prisma.customerSegment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!segment || segment.organizationId !== organizationId) {
      throw new AppError(404, 'Segment not found');
    }

    return segment;
  }

  static async updateSegment(
    id: string,
    data: {
      name?: string;
      description?: string;
      rules?: any;
      isActive?: boolean;
    }
  ): Promise<CustomerSegment> {
    const segment = await this.getSegmentById(id);

    return prisma.customerSegment.update({
      where: { id: segment.id },
      data,
    });
  }

  static async addMembers(segmentId: string, customerIds: string[], assignedBy?: string): Promise<{ count: number }> {
    const segment = await this.getSegmentById(segmentId);
    const organizationId = getTenantId();

    if (segment.type !== SegmentType.MANUAL) {
      throw new AppError(400, 'Members can only be manually added to MANUAL segments');
    }

    // Verify customers belong to the organization
    const validCustomers = await prisma.customer.findMany({
      where: { id: { in: customerIds }, organizationId },
      select: { id: true },
    });

    const validCustomerIds = validCustomers.map(c => c.id);

    if (validCustomerIds.length === 0) {
      return { count: 0 };
    }

    // Insert only those not already in the segment
    const result = await prisma.customerSegmentMember.createMany({
      data: validCustomerIds.map(customerId => ({
        segmentId: segment.id,
        customerId,
        assignedBy,
      })),
      skipDuplicates: true,
    });

    return { count: result.count };
  }

  static async removeMembers(segmentId: string, customerIds: string[]): Promise<{ count: number }> {
    const segment = await this.getSegmentById(segmentId);

    if (segment.type !== SegmentType.MANUAL) {
      throw new AppError(400, 'Members can only be manually removed from MANUAL segments');
    }

    const result = await prisma.customerSegmentMember.deleteMany({
      where: {
        segmentId: segment.id,
        customerId: { in: customerIds },
      },
    });

    return { count: result.count };
  }
}
