import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../errors/AppError';

export const resolvePublicTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    
    if (!tenantSlug) {
      throw new AppError(400, 'TENANT_REQUIRED', 'Missing x-tenant-slug header');
    }

    const organization = await prisma.organization.findUnique({
      where: { slug: tenantSlug, status: 'ACTIVE', deletedAt: null }
    });

    if (!organization) {
      throw new AppError(404, 'TENANT_NOT_FOUND', 'Organization not found or inactive');
    }

    // Attach to request (we can reuse req.auth just for organizationId but it's not a real user auth)
    // We'll create req.publicTenant
    (req as any).publicTenant = {
      organizationId: organization.id,
      slug: organization.slug
    };

    next();
  } catch (error) {
    next(error);
  }
};
