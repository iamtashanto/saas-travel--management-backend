import { prisma } from '../../config/database';
import { AutomationRule, Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error-handler';
import { getTenantId } from '../../common/utils/tenant-context';

export class AutomationService {
  static async createRule(data: {
    name: string;
    trigger: string;
    conditions?: any;
    actions: any;
    isActive?: boolean;
  }): Promise<AutomationRule> {
    const organizationId = getTenantId();

    return prisma.automationRule.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  static async listRules(filters: { isActive?: boolean }): Promise<AutomationRule[]> {
    const organizationId = getTenantId();

    const where: Prisma.AutomationRuleWhereInput = {
      organizationId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    return prisma.automationRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getRuleById(id: string): Promise<AutomationRule> {
    const organizationId = getTenantId();
    
    const rule = await prisma.automationRule.findUnique({
      where: { id },
    });

    if (!rule || rule.organizationId !== organizationId) {
      throw new AppError(404, 'Automation rule not found');
    }

    return rule;
  }

  static async updateRule(
    id: string,
    data: {
      name?: string;
      trigger?: string;
      conditions?: any;
      actions?: any;
      isActive?: boolean;
    }
  ): Promise<AutomationRule> {
    const rule = await this.getRuleById(id);

    return prisma.automationRule.update({
      where: { id: rule.id },
      data,
    });
  }
}
